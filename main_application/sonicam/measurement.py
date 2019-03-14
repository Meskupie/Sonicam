import cv2
import numpy as np
import time
import math
import logging
import tensorflow as tf
from scipy.optimize import linear_sum_assignment

import multiprocessing as mp

from parameters import *
from mtcnn.detect_face import Detector


# =============
# Face Detector
# =============
class FaceDetector(mp.Process):
    def __init__(self,name,queues,buffer_frames,pyramid_frames):
        super(FaceDetector,self).__init__()
        self.name = name

        # Grab references to linking data
        self.job_queue = queues['face_detector']
        self.master_queue = queues['master']
        self.frame_server_queue = queues['frame_server']
        
        global shared_vars
        shared_vars['buffer_frames'] = buffer_frames
        shared_vars['pyramid_frames'] = pyramid_frames
        
        # Start the Process
        self.start()
    
    
    # Converts the param_pyramid_scalings and src to a list for job creation
    def createScaleList(self):
        full_output = [[] for _ in range(len(param_pyramid_scalings))]
        for i in range(len(param_pyramid_scalings)):
            cur = i
            chain = []
            while True:
                chain.append(cur)
                cur = param_pyramid_scaling_srcs[cur]
                if cur == -1:
                    break
            full_output[chain[-1]].append(chain[::-1])
        return [x for x in full_output if x != []]
    
    
    def initObjects(self):
        self.states = {'idle':0,'input':1,'initialization':-1}
        self.internal_state = self.states['idle']
        self.pyramid_scale_jobs = self.createScaleList()
        self.pyramid_count = 0
        self.frame_index = -1
        self.initial_detection = True
    
    def createDetector(self):
        # Set Model
        with tf.Graph().as_default():
            sess = tf.Session(config=param_tf_mtcnn_config)
            with sess.as_default():
                self.detector = Detector(sess,threshold=param_detector_thresholds,img_shape=param_frame_shape[0:2])

    def spinDetector(self):
        self.master_queue.put({'type':'ready','src':self.name})
        while True:
            job = self.job_queue.get()
            try:
                if job['type'] == 'kill':
                    break
                
                if self.internal_state == self.states['idle']:
                    if job['type'] == 'detect':
                        logging.debug('Starting Detection')
                        self.detector.reset()
                        self.internal_state = self.states['input']
                        self.detector.reset()
                        self.pyramid_count = 0
                        self.frame_server_queue.put({'type':'pyramid','time':None,'patterns':self.pyramid_scale_jobs})
                    else:
                        logging.error('called '+str(job['type'])+' durring idle')
                
                elif self.internal_state == self.states['input']:
                    if job['type'] == 'pyramid_data':
                        # For the first frame, drop the lock and ignore the coresponding frame (initalization time)
                        if self.initial_detection and self.pyramid_count == 0:
                            self.frame_server_queue.put({'type':'unlock_frame','buffer_index':job['buffer_index']})
                        self.detector.runFirstStage(shared_vars['pyramid_frames'][job['pyramid_index']][1])
                        self.pyramid_count += 1
                        if self.pyramid_count == len(param_pyramid_scalings):
                            results = self.detector.runSecondStage(shared_vars['buffer_frames'][job['buffer_index']][1])
                            self.internal_state = self.states['idle']
                            # Signal that this frame should be ignored
                            if self.initial_detection:
                                buffer_index = None
                                self.initial_detection = False
                            else:
                                buffer_index = job['buffer_index']
                            self.master_queue.put({'type':'face_results','results':results,'buffer_index':buffer_index,'frame_time':job['frame_time']})
                            logging.debug('Detection Complete')
                    else:
                        logging.error('called '+str(job['type'])+' durring input')
                            
            except KeyError as e:
                logging.error('Could not service video driver job with tag: '+str(e))
        
    def killSelf(self):
        pass
    
    def run(self):
        logging.info('Starting Process')
        try:
            self.initObjects()
            self.createDetector()
            self.spinDetector()
        except Exception as e:
            logging.error('Killed due to ' + str(e))
            self.killSelf()
        finally:
            logging.info('Shutting Down Process')
        
    def kill(self):
        self.job_queue.put({'type':'kill'})
        self.join()


# =============
# Kalman Filter Tracker
# =============
class Tracker():
    def __init__(self):
        self.reset()
        class ArgumentError(Exception):
            pass

    def reset(self):
        self.track_filters = []
        self.time_last = time.time()
        self.new_id = 0
    
    def predictionUpdate(self,time):
        # logging.info('======= prediction update =======')
        # Run prediction and prune tracks that are no longer "alive"
        alive_tracks = []
        for i,track in enumerate(self.track_filters):
            track.predictionUpdate(time)
            if track.alive:
                alive_tracks.append(i)
        self.track_filters = [self.track_filters[i] for i in alive_tracks]
        self.time_last = time
        
        # Return new estimate
        
    def measurementUpdate(self,time,results):
        # logging.info('======= measurement update =======')
        measure, measure_transformed = Tracker.measureStateEstimate(results)

        track_locations = [t.location for t in self.track_filters]
        #logging.info('Tracks: '+str(track_locations))
        #logging.info('Measur: '+str(measure_transofrmed))
        measure_link = Tracker.measureAssignment(track_locations,measure_transformed,dist_func=param_dist_func)
        #logging.info('Links : '+str(measure_link))
        # logging.info('Measur: '+str(measure))
        
        for i,link in enumerate(measure_link):
            if link == None: # No assosiated tracker
                new_track = EKF(self.new_id,time,pos_start=measure_transformed[i])
                self.new_id += 1
                #new_track.predictionUpdate(self.time_last)
                self.track_filters.append(new_track)
            else: # Measure update the tracker
                self.track_filters[link].measureUpdate(time,measure[i])
                self.track_filters[link].location_meas = measure_transformed[i]
                
        #for track in self.track_filters:
        #    logging.info('Track '+str(track.track_id)+': '+str(max(track.uncertainty_meas)))
    
    def getEstimation(self):
        estimation = []
        for track in self.track_filters:
            estimation.append({'id':track.track_id,'location':track.location,'uncertainty':track.uncertainty})
        return estimation
    
    
    def measureAssignment(tracks,measure,dist_func='norm'):
        if dist_func == 'norm':
            dist_func_lam =  lambda x: np.linalg.norm(x[0]-x[1])
        else:
            raise ArgumentError('This distance function has not been implimented')
        max_dim = max(len(tracks),len(measure))
        min_dim = min(len(tracks),len(measure))
        measure_link = [None]*len(measure)
        if min_dim > 0:
            cost = -np.ones((max_dim,max_dim)) # [i,j]:(track,measure)
            for i,t in enumerate(tracks):
                for j,m in enumerate(measure):
                    dist = dist_func_lam((t,m))
                    if dist < param_target_search_treshold:
                        cost[i,j] = dist
                    else:
                        cost[i,j] = 100
            t_link,m_link = linear_sum_assignment(cost)

            for i in range(max_dim):
                if m_link[i] < len(measure):
                    cost_link = cost[t_link[i],m_link[i]]
                    if cost_link >= 0 and cost_link < param_target_search_treshold:
                        measure_link[m_link[i]] = t_link[i]
        #             else: # negative cost from filler node (if cost_link < 0), inf cost from invalid connection
        #                 pass
        # else:
        #     if len(tracks) == 0:
        #         for i in range(len(measure)):
        #             pass
        #     else:
        #         # No measurements
        #         pass
        return measure_link
    
    def measureStateEstimate(results):
        measure = []
        measure_transformed = []
        for result in results:
            bb = result['box']
            pw = (bb[2]+bb[3])/2
            state_d = param_fov_l*param_face_diameter/pw
            px_c = (bb[0]+(bb[2]/2.0))-(param_frame_shape[1]/2)
            state_x = state_d*px_c/param_fov_l
            py_c = (param_frame_shape[0]/2)-(bb[1]+(bb[3]/2.0))
            state_y = state_d*py_c/param_fov_l
            
            measure.append(np.array([px_c,py_c,pw]))
            measure_transformed.append(np.array([state_x,state_y,state_d]))
        return measure, measure_transformed
    
    def boundingBoxFromState(full_state,scale=1):
        if len(full_state) == 6:
            state = full_state[[0,2,4]]
        else:
            state = full_state
        px_c = state[0]*param_fov_l/state[2]
        py_c = state[1]*param_fov_l/state[2]
        pw = param_fov_l*param_face_diameter/state[2]
        diam = pw*scale
        
        bb = np.zeros(4,dtype=int)
        bb[0] = int(round(px_c-(diam/2)+(param_frame_shape[1]/2)))
        #px_c-(bb[2]/2.0)+(param_frame_shape[1]/2) = bb[0]
        bb[1] = int(round(-py_c-(diam/2)+(param_frame_shape[0]/2)))
        #-py_c-(bb[3]/2.0)+(param_frame_shape[0]/2) = bb[1]
        bb[2] = diam
        bb[3] = diam
        return bb
    
    
class EKF():
    def __init__(self,track_id,time,pos_start=np.array([0,0,0])):
        self.alive = True
        self.track_id = track_id
        
        self.R = np.diag(np.square(param_motion_stddev))
        self.Q = np.diag(np.square(param_measure_stddev))
        
        self.time_buffer = np.zeros(param_tracker_buffer_length)
        self.x_buffer = np.zeros((6,param_tracker_buffer_length))
        self.u_buffer = np.zeros((3,param_tracker_buffer_length))
        self.s_buffer = np.zeros((6,6,param_tracker_buffer_length))
        
        self.i_pre = 0
        self.i_cur = 1
        self.x_buffer[:,self.i_pre] = np.array([pos_start[0],0,pos_start[1],0,pos_start[2],0])
        self.s_buffer[:,:,self.i_pre] = np.diag(np.square(param_motion_stddev)*param_motion_start_k)
        self.time_buffer[self.i_pre] = time
        
        self.location = self.getLocation()
        self.uncertainty = self.getUncertainty()
        self.location_meas = self.getLocation()
        self.uncertainty_meas = self.getUncertainty()
    
    def predictionUpdate(self,time):
        logging.debug('Starting prediction update')
        
        self.time_buffer[self.i_cur] = time
        dt = self.time_buffer[self.i_cur]-self.time_buffer[self.i_pre]
        dt = max(0,dt)
        
        self.x_buffer[:,self.i_cur] = EKF.runMotionModel(dt,self.x_buffer[:,self.i_pre])
        
        G = EKF.calculateG(dt)
        self.s_buffer[:,:,self.i_cur] = np.matmul(np.matmul(G,self.s_buffer[:,:,self.i_pre]),np.transpose(G))+self.R
        
        self.i_pre = self.i_cur
        self.i_cur += 1
        self.updateIteration()
        
        if self.i_cur >= param_tracker_buffer_length:
            logging.error('Overran tracking buffer between measurements (index)')
        
        #logging.info('Track '+str(self.track_id)+' state '+str(self.x_buffer[:,self.i_pre]))
        logging.debug('Done prediction update')
    
    def measureUpdate(self,time,measure):
        logging.debug('Starting measurement update')
        
        new_time_buffer = np.zeros(param_tracker_buffer_length)
        new_x_buffer = np.zeros((6,param_tracker_buffer_length))
        new_u_buffer = np.zeros((3,param_tracker_buffer_length))
        new_s_buffer = np.zeros((6,6,param_tracker_buffer_length))
        new_i_pre = 0
        new_i_cur = 1
        
        # Find the index closest to measurement time, use this to extrapolate from
        link_i = np.argmin(np.abs(self.time_buffer-time))
        dt = (self.time_buffer[link_i]-time)
        
        # logging.info('Track '+str(self.track_id)+' buffer '+str((self.time_buffer[np.nonzero(self.time_buffer)]-time)))
        # logging.info('Track '+str(self.track_id)+' link '+str(link_i))
        # logging.info('Track '+str(self.track_id)+' dt '+str(dt))
        # logging.info('Track '+str(self.track_id)+' state '+str(self.x_buffer[:,link_i]))
        
        if abs(dt) > 0.001:
            logging.error('Overran tracking buffer between measurements (time)')
        
        # Set the initial
        new_x_buffer[:,new_i_pre] = self.x_buffer[:,link_i]
        new_s_buffer[:,:,new_i_pre] = self.s_buffer[:,:,link_i]
        new_time_buffer[new_i_pre] = self.time_buffer[link_i]
        
        X = new_x_buffer[:,new_i_pre]
        S = new_s_buffer[:,:,new_i_pre]
        H = EKF.calculateH(new_x_buffer[:,new_i_pre])
        K = np.matmul(np.matmul(S,np.transpose(H)),np.linalg.inv(np.matmul(np.matmul(H,S),np.transpose(H))+self.Q))
        Inov = measure-EKF.estimateMeasurement(new_x_buffer[:,new_i_pre])
        # logging.info('Track '+str(self.track_id)+' measure '+str(measure))
        # logging.info('Track '+str(self.track_id)+' predict '+str(EKF.estimateMeasurement(new_x_buffer[:,new_i_pre])))
        
        # update the values in the buffer based on the measurement
        new_x_buffer[:,new_i_pre] = X+np.matmul(K,Inov)
        new_s_buffer[:,:,new_i_pre] = np.matmul(np.eye(6)-np.matmul(K,H),new_s_buffer[:,:,new_i_pre])
        
        for i in range(0,self.i_pre-link_i):
            new_time_buffer[new_i_cur] = self.time_buffer[link_i+i+1]
            dt = max(0,new_time_buffer[new_i_cur+i]-new_time_buffer[new_i_pre])
            new_x_buffer[:,new_i_cur] = EKF.runMotionModel(dt,new_x_buffer[:,new_i_pre])
            G = EKF.calculateG(dt)
            new_s_buffer[:,:,new_i_cur] = np.matmul(np.matmul(G,new_s_buffer[:,:,new_i_pre]),np.linalg.inv(G))+self.R
            
            new_i_pre = new_i_cur
            new_i_cur += 1
        
        self.time_buffer = new_time_buffer
        self.x_buffer = new_x_buffer
        self.u_buffer = new_u_buffer
        self.s_buffer = new_s_buffer
        
        self.i_pre = new_i_pre
        self.i_cur = new_i_cur
        
        self.updateIteration()
        self.uncertainty_meas = self.getUncertainty()
        
        logging.debug('Done measurement update')
        
    def updateIteration(self):
        self.location = self.getLocation()
        self.uncertainty = self.getUncertainty()

        if max(self.uncertainty) > param_max_uncertainty:
            self.alive = False
            
    def getLocation(self):
        return self.x_buffer[[0,2,4],self.i_pre]
    
    def getUncertainty(self):
        return np.linalg.eig(self.s_buffer[:,:,self.i_pre])[0]
    
    def calculateG(dt):
        # Build the matrix
        G = np.zeros((6,6))
        G[0,0] = 1
        G[0,1] = dt
        G[1,1] = 1
        G[2,2] = 1
        G[2,3] = dt
        G[3,3] = 1
        G[4,4] = 1
        G[4,5] = dt
        G[5,5] = 1
        return G
        
    def calculateH(state):
        # Pre-compute
        x_4_2 = state[4]**2
        # Build the matrix
        H = np.zeros((3,6))
        H[0,0] = param_fov_l/state[4]
        H[0,4] = -param_fov_l*state[0]/x_4_2
        H[1,2] = param_fov_l/state[4]
        H[1,4] = -param_fov_l*state[2]/x_4_2
        H[2,4] = -param_fov_l*param_face_diameter/x_4_2#1
        return H
        
    def estimateMeasurement(state):
        measure = np.zeros(3)
        measure[0] = (state[0]*param_fov_l)/state[4]
        measure[1] = (state[2]*param_fov_l)/state[4]
        measure[2] = param_fov_l*param_face_diameter/state[4]
        return measure
        
    def runMotionModel(dt,state):
        new_state = np.zeros(state.shape)
        new_state[0] = state[1]*dt+state[0]
        new_state[1] = state[1]
        new_state[2] = state[3]*dt+state[2]
        new_state[3] = state[3]
        new_state[4] = state[5]*dt+state[4]
        new_state[5] = state[5]
        return new_state