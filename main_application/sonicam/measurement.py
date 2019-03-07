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
        self.master_queue = queues['master']
        self.job_queue = queues['face_detector']
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
        self.states = {'idle':0,'input':1}
        self.internal_state = self.states['idle']
        self.pyramid_scale_jobs = self.createScaleList()
        self.pyramid_count = 0
        self.frame_index = -1
    
    def createDetector(self):
        # Set Model
        with tf.Graph().as_default():
            sess = tf.Session(config=param_tf_mtcnn_config)
            with sess.as_default():
                self.detector = Detector(sess,threshold=param_detector_thresholds,img_shape=param_frame_shape[0:2])

    def spinDetector(self):
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
                        self.detector.runFirstStage(shared_vars['pyramid_frames'][job['pyramid_index']][1])
                        self.pyramid_count += 1
                        if self.pyramid_count == len(param_pyramid_scalings):
                            results = self.detector.runSecondStage(shared_vars['buffer_frames'][job['buffer_index']][1])
                            self.internal_state = self.states['idle']
                            self.master_queue.put({'type':'face_detector_results','results':results,'buffer_index':job['buffer_index'],'frame_time':job['frame_time']})
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
class Tracker(mp.Process):
    def __init__(self,name,queues):
        super(Tracker,self).__init__()
        self.name = name
        # Grab references to linking data
        self.job_queue = queues['tracker']
        self.master_queue = queues['master']
        self.frame_server_queue = queues['frame_server']
        # Start the Process
        self.start()
    
    def initalizeObjects(self):
        self.track_filters = []
        self.time_last = time.time()
        self.new_id = 0
        
        class ArgumentError(Exception):
            pass
    
    def predictionUpdate(self,time):
        alive_tracks = []
        for i,track in enumerate(self.track_filters):
            track.predictionUpdate(time)
            if track.alive:
                alive_tracks.append(i)
                
        self.track_filters = [self.track_filters[i] for i in alive_tracks]
        self.time_last = time
        
    
    def measurementUpdate(self,time,results):
        measure, measure_transformed = Tracker.measureStateEstimate(results)
        logging.info(measure_transformed)
        
        
        
        
        
        
        track_locations = [t.location for t in self.track_filters]
        measure_link = Tracker.measureAssignment(track_locations,measure_transformed,dist_func=param_dist_func)
        
        for i,link in enumerate(measure_link):
            if link == None: # No assosiated tracker
                new_track = EKF(self.new_id,time,pos_start=measure_transformed[i])
                self.new_id += 1
                #new_track.predictionUpdate(self.time_last)
                self.track_filters.append(new_track)
            else: # Measure update the tracker
                self.track_filters[link].measureUpdate(time,measure[i])
    
    def getEstimation(self):
        estimation = []
        for track in self.track_filters:
            estimation.append({'id':track.track_id,'location':track.location,'uncertainty':track.uncertainty})
        return estimation
    
    def spinServiceJobs(self):
        time_last = 0
        # =============
        # Main loop
        # =============
        while True:
            job = self.job_queue.get()
            try:
                if job['type'] == 'kill':
                    self.killSelf()
                    break
                
                elif job['type'] == 'pred_update':
                    self.predictionUpdate(job['frame_time'])
                    estimation = self.getEstimation()
                    self.master_queue.put({'type':'estimation','estimation':estimation,'buffer_index':job['buffer_index']})
                
                elif job['type'] == 'mes_update':
                    self.measurementUpdate(job['frame_time'],job['results'])
                    estimation = self.getEstimation()
                    self.master_queue.put({'type':'estimation','estimation':estimation,'buffer_index':job['buffer_index']})
                else:
                    logging.error('Unknown job type: '+str(job['type']))
                    
            except KeyError as e:
                        logging.error('Could not service job with tag: '+str(e))
      
    
    def killSelf(self):
        pass
    
    def run(self):
        logging.info('Starting Process')
        try:
            self.initalizeObjects()
            self.spinServiceJobs()
        except Exception as e:
            logging.error('Killed due to ' + str(e))
            self.killSelf()
        finally:
            logging.info('Shutting Down Process')
        
    # External kill command
    def kill(self):
        self.job_queue.put({'type':'kill'})
        self.join()
    
    
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
            state_d = param_fov_l*param_face_diameter/((bb[2]+bb[3])/2)
            px_c = (bb[0]+(bb[2]/2.0))-(param_frame_shape[1]/2)
            state_x = state_d*px_c/param_fov_l
            py_c = (param_frame_shape[0]/2)-(bb[1]+(bb[3]/2.0))
            state_y = state_d*py_c/param_fov_l
            
            measure.append(np.array([px_c,py_c,state_d]))
            measure_transformed.append(np.array([state_x,state_y,state_d]))
        return measure, measure_transformed


class EKF():
    def __init__(self,track_id,time,pos_start=np.array([0,0,0])):
        self.alive = True
        self.track_id = track_id
        self.location = pos_start
        self.uncertainty = param_motion_stddev*param_motion_start_k
        
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
        self.time_buffer[0] = time
    
    def updateIteration(self):
        # update location
        state = self.x_buffer[:,self.i_pre]
        self.location = np.array([state[0],state[2],state[4]])
        
        # update lost flag
        self.uncertainty,error_axis = np.linalg.eig(self.s_buffer[:,:,self.i_pre])
        if max(self.uncertainty) > param_max_uncertainty:
            self.alive = False
    
    def measureUpdate(self,time,measure):
        logging.debug('Starting measurement update')
        
        new_time_buffer = np.zeros(param_tracker_buffer_length)
        new_x_buffer = np.zeros((6,param_tracker_buffer_length))
        new_u_buffer = np.zeros((3,param_tracker_buffer_length))
        new_s_buffer = np.zeros((6,6,param_tracker_buffer_length))
        new_i_pre = 0
        new_i_cur = 1
        
        #logging.info(str(time)+' === \n'+str(self.time_buffer))
        link_i = np.argmin(np.abs(self.time_buffer-time))
        #logging.info(str(link_i))
        
        
        
        dt = (self.time_buffer[link_i]-time)
        logging.info(str(dt))
        if abs(dt) > 0.001:
            logging.error('Overran tracking buffer between measurements (time)')
        
        new_x_buffer[:,new_i_pre] = self.x_buffer[:,link_i]
        new_s_buffer[:,:,new_i_pre] = self.s_buffer[:,:,link_i]
        new_time_buffer[new_i_pre] = time
        
        X = new_x_buffer[:,new_i_pre]
        S = new_s_buffer[:,:,new_i_pre]
        H = EKF.calculateH(new_x_buffer[:,new_i_pre])
        K = np.matmul(np.matmul(S,np.transpose(H)),np.linalg.inv(np.matmul(np.matmul(H,S),np.transpose(H))+self.Q))
        Inov = measure-EKF.estimateMeasurement(new_x_buffer[:,new_i_pre])
        
        # update the values in the buffer based on the measurement
        new_x_buffer[:,new_i_pre] = X+np.matmul(K,Inov)
        new_s_buffer[:,new_i_pre] = np.matmul(np.eye(6)-np.matmul(K,H),new_s_buffer[:,new_i_pre])
        
        for i in range(1,self.i_cur-link_i):
            new_time_buffer[new_i_pre+i] = self.time_buffer[link_i+i]
            dt = max(0,new_time_buffer[new_i_pre+i]-new_time_buffer[new_i_pre+i-1])
            new_x_buffer[:,new_i_pre+i] = EKF.runMotionModel(dt,new_x_buffer[:,new_i_pre+i-1])
            G = EKF.calculateG(dt)
            new_s_buffer[:,:,new_i_pre+i] = np.matmul(np.matmul(G,new_s_buffer[:,:,new_i_pre+i-1]),np.linalg.inv(G))+self.R
            
            new_i_pre = new_i_cur
            new_i_cur = new_i_cur + 1
        
        self.time_buffer = new_time_buffer
        self.x_buffer = new_x_buffer
        self.u_buffer = new_u_buffer
        self.s_buffer = new_s_buffer
        
        self.i_pre = new_i_pre
        self.i_cur = new_i_cur
        
        self.updateIteration()
        
        logging.debug('Done measurement update')
        
        
    def predictionUpdate(self,time):
        logging.debug('Starting prediction update')
        
        self.time_buffer[self.i_cur] = time
        dt = max(0,self.time_buffer[self.i_cur]-self.time_buffer[self.i_pre])
        
        self.x_buffer[:,self.i_cur] = EKF.runMotionModel(dt,self.x_buffer[:,self.i_pre])
        G = EKF.calculateG(dt)
        self.s_buffer[:,:,self.i_cur] = np.matmul(np.matmul(G,self.s_buffer[:,:,self.i_pre]),np.linalg.inv(G))+self.R
        
        self.i_pre = self.i_cur
        self.i_cur = self.i_cur + 1
        
        self.updateIteration()

        if self.i_cur >= param_tracker_buffer_length:
            logging.error('Overran tracking buffer between measurements (index)')
        
        logging.debug('Done prediction update')
        
        
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
        H[2,4] = 1
        return H
        
    def estimateMeasurement(state):
        measure = np.zeros(3)
        measure[0] = (state[0]/state[4])*param_fov_l
        measure[1] = (state[2]/state[4])*param_fov_l
        measure[2] =  state[4]
        return measure
        
    def runMotionModel(dt,state):
        new_state = np.zeros(state.shape)
        new_state[0] = state[1]*dt+state[0]
        new_state[1] = state[1]
        new_state[2] = state[3]*dt+state[2]
        new_state[3] = state[2]
        new_state[4] = state[5]*dt+state[4]
        new_state[5] = state[5]
        return new_state


# =============
# Measurement Generator
# =============
# class MeasGenerator():
#     def __init__(self,settings_):
#         self.settings = settings_
#         self.frame_shape = (1080,1920)
        
#     def checkValidBox(self,box):
#         if not (0 <= box[0] <= self.frame_shape[1]): return False
#         if not (0 <= box[1] <= self.frame_shape[0]): return False
#         if not (0 <= box[0]+box[2] <= self.frame_shape[1]): return False
#         if not (0 <= box[1]+box[3] <= self.frame_shape[0]): return False
#         return True
        
#     def buildBox(self,center,box_radius):
#         box = [int(round(center[0]-box_radius)),int(round(center[1]-box_radius)), int(round(box_radius*2)),int(round(box_radius*2))]
#         return box
    
#     def getData(self,time):
#         results = []
#         for person in self.settings:
#             if person['start'] <= time <= person['end']:
                
#                 # {'id':<int>,'type':<str>,'position':(<x_centre>,<y_centre>,<radius>),'depth':(<x_bot_left>,<y_bot_left>,<x_top_right>,<y_top_right>),'speed':<px/s>,'start':<time_start_s>,'end':<time_end_s>}
#                 if person['type'] == 'circle':
#                     # Calculate circle phasor
#                     phasor = (math.cos(time*person['speed']/person['position'][2]),math.sin(time*person['speed']/person['position'][2]))
#                     # Find box centre
#                     center = (phasor[0]*person['position'][2]+person['position'][0],phasor[1]*person['position'][2]+person['position'][1])
#                     # Calculate box_radius
#                     if (person['depth'][0] == person['depth'][1]) and \
#                         (person['depth'][2] == person['depth'][3]): # horizontal
#                         left = person['depth'][0]
#                         right = person['depth'][3]
#                         box_radius = (((phasor[0]+1)/2)*(right-left)+left)/2
#                     elif (person['depth'][0] == person['depth'][3]) and \
#                         (person['depth'][1] == person['depth'][2]): # vertical
#                         up = person['depth'][1]
#                         down = person['depth'][0]
#                         box_radius = (((phasor[1]+1)/2)*(up-down)+down)/2
#                     else:
#                         print('cant handle this input (depth)')
#                     # Build box
#                     box = self.buildBox(center,box_radius)
#                     if not self.checkValidBox(box):
#                         continue
                 
#                 # {'id':<int>,'type':<str>,'position':(<x_start>,<y_start>,<x_end>,<y_end>),'depth':(<at_start>,<at_end>),'speed':<px/s>,'start':<time_start_s>,'end':<time_end_s>}s
#                 if person['type'] == 'line':
#                     dx = person['position'][2]-person['position'][0]
#                     dy = person['position'][3]-person['position'][1]
#                     dd = person['depth'][1]-person['depth'][0]
#                     length = math.sqrt(dx*dx+dy*dy)
#                     # determine where in the current movement cycle the object would be
#                     mv_ratio = (person['speed']*time)/length
#                     mv_percent = mv_ratio%1
#                     # Calculate box center and depth
#                     if math.floor(mv_ratio)%2 == 0: # going from start to end
#                         #start+dm
#                         center = (person['position'][0]+dx*mv_percent,person['position'][1]+dy*mv_percent)
#                         box_radius = person['depth'][0]+dd*mv_percent
#                     else: # going from end to start
#                         #end-dm
#                         center = (person['position'][2]-dx*mv_percent,person['position'][3]-dy*mv_percent)
#                         box_radius = person['depth'][1]-dd*mv_percent
#                     # Build box
#                     box = self.buildBox(center,box_radius)
#                     if not self.checkValidBox(box):
#                         continue
                    
#                 # {'id':<int>,'type':<str>,'position':(<x>,<y>),'depth':(<depth>),'start':<time_start_s>,'end':<time_end_s>}
#                 if person['type'] == 'point':
#                     center = (person['position'][0],person['position'][1])
#                     box_radius = person['depth']
#                     box = self.buildBox(center,box_radius)
#                     if not self.checkValidBox(box):
#                         continue
                
#                 result = {'id':person['id'],'box':box,'confidence':None,'keypoints':None}
#                 results.append(result)
#         return results


# class EKF():
#     def __init__(self,x_start=np.array([0,0,0,0,0,0])):
#         buffer_length = 200
#         frame_shape = (1080,1920)
#         aov = math.radians(72)
        
#         self.x_buffer = np.zeros(6,buffer_length)
#         self.u_buffer = np.zeros(3,buffer_length)
        
#         self.i_pre = 0
#         self.i_cur = 1
#         self.x_buffer[:,self.i_pre] = x_start
        
#         self.fov_lx = (frame_shape[1]/(2*math.tan(aov/2)))
#         self.fov_ly = (frame_shape[0]/(2*math.tan(aov/2)))
                 
#     def calculateG(self):
#         # Pre-calculate various co-efficients
#         x_0_2 = self.x_buffer[0,self.i_pre]**2
#         x_2_2 = self.x_buffer[2,self.i_pre]**2
#         x_4_2 = self.x_buffer[4,self.i_pre]**2
#         r_0_i = self.u_buffer[2,self.i_cur]+math.atan(self.x_buffer[0,self.i_pre]/self.x_buffer[4,self.i_pre])
#         r_2_i = self.u_buffer[1,self.i_cur]+math.atan(self.x_buffer[2,self.i_pre]/self.x_buffer[4,self.i_pre])
        
#         # Build the matrix
#         G = np.zeros(6,6)
#         G[0,0] = -1+math.cos(u_buffer[0,self.i_cur])+(1/((1+(x_0_2/x_4_2))*(math.cos(r_0_i)**2)))
#         G[0,1] = self.dt
#         G[0,2] = math.sin(u_buffer[0,self.i_cur])
#         G[0,4] = -((self.x_buffer[0,self.i_pre]*self.x_buffer[4,self.i_pre])/((x_0_2+x_4_2)*cos(r_0_i)**2))+(sin(r_0_i)/cos(r_0_i))
#         G[1,1] = 1
#         G[2,0] = math.cos(u_buffer[0,self.i_cur])
#         G[2,2] = -1+sin(u_buffer[0,self.i_cur])+(1/((1+(x_2_2/x_4_2))*(math.cos(r_2_i)**2)))
#         G[2,3] = self.dt
#         G[2,4] = -((self.x_buffer[2,self.i_pre]*self.x_buffer[4,self.i_pre])/((x_2_2+x_4_2)*cos(r_2_i)**2))+(sin(r_2_i)/cos(r_2_i))
#         G[3,3] = 1
#         G[4,4] = 1
#         G[4,5] = self.dt
#         G[5,5] = 1
#         return G
        
#     def calculateH(self):
#         # Pre-compute
#         x_4_2 = self.x_buffer[4,self.i_cur]**2
        
#         # Build the matrix
#         H = np.zeros(6,3)
#         H[0,0] = self.fov_lx/self.x_buffer[4,self.i_cur]
#         H[4,0] = self.fov_lx*self.x_buffer[0,self.i_cur]/x_4_2
#         H[2,1] = self.fov_ly/self.x_buffer[4,self.i_cur]
#         H[4,1] = self.fov_ly*self.x_buffer[2,self.i_cur]/x_4_2
#         H[4,2] = 1
#         return H
    
#     def motionModel(self):
#         self.x_buffer[0,self.i_cur] = self.x_buffer[1,self.i_pre]*self.dt+math.tan(math.atan(self.x_buffer[0,self.i_pre]/self.x_buffer[4,self.i_pre])+u_buffer[2,self.i_cur])*self.x_buffer[4,self.i_pre]+self.x_buffer[0,self.i_pre]*math.cos(-self.u_buffer[0,self.i_cur])-self.x_buffer[2,self.i_pre]*math.sin(-self.u_buffer[0,self.i_cur])-self.x_buffer[0,self.i_pre]
#         self.x_buffer[1,self.i_cur] = self.x_buffer[1,self.i_pre]
#         self.x_buffer[2,self.i_cur] = self.x_buffer[3,self.i_pre]*self.dt+math.tan(math.atan(self.x_buffer[2,self.i_pre]/self.x_buffer[4,self.i_pre])+u_buffer[1,self.i_cur])*self.x_buffer[4,self.i_pre]+self.x_buffer[0,self.i_pre]*math.sin(-self.u_buffer[0,self.i_cur])+self.x_buffer[2,self.i_pre]*math.cos(-self.u_buffer[0,self.i_cur])-self.x_buffer[2,self.i_pre]
#         self.x_buffer[3,self.i_cur] = self.x_buffer[2,self.i_pre]
#         self.x_buffer[4,self.i_cur] = self.x_buffer[5,self.i_pre]*self.dt+self.x_buffer[4,self.i_pre]
#         self.x_buffer[5,self.i_cur] = self.x_buffer[5,self.i_pre]
        
#     def estimateMeasurement(self):
#         meas = np.zeros(3)
#         meas[0] = (self.x_buffer[0,self.i_cur]/self.x_buffer[4,self.i_cur])*self.fov_lx
#         meas[1] = (self.x_buffer[2,self.i_cur]/self.x_buffer[4,self.i_cur])*self.fov_ly
#         meas[2] =  self.x_buffer[4,self.i_cur]
#         return meas
