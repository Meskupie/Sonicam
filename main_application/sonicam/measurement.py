import time
import math
import logging
import tensorflow as tf

import multiprocessing as mp

from parameters import *
from mtcnn.detect_face import Detector



class MeasGenerator():
    def __init__(self,settings_):
        self.settings = settings_
        self.frame_shape = (1080,1920)
        
    def checkValidBox(self,box):
        if not (0 <= box[0] <= self.frame_shape[1]): return False
        if not (0 <= box[1] <= self.frame_shape[0]): return False
        if not (0 <= box[0]+box[2] <= self.frame_shape[1]): return False
        if not (0 <= box[1]+box[3] <= self.frame_shape[0]): return False
        return True
        
    def buildBox(self,center,box_radius):
        box = [int(round(center[0]-box_radius)),int(round(center[1]-box_radius)), int(round(box_radius*2)),int(round(box_radius*2))]
        return box
    
    def getData(self,time):
        results = []
        for person in self.settings:
            if person['start'] <= time <= person['end']:
                
                # {'id':<int>,'type':<str>,'position':(<x_centre>,<y_centre>,<radius>),'depth':(<x_bot_left>,<y_bot_left>,<x_top_right>,<y_top_right>),'speed':<px/s>,'start':<time_start_s>,'end':<time_end_s>}
                if person['type'] == 'circle':
                    # Calculate circle phasor
                    phasor = (math.cos(time*person['speed']/person['position'][2]),math.sin(time*person['speed']/person['position'][2]))
                    # Find box centre
                    center = (phasor[0]*person['position'][2]+person['position'][0],phasor[1]*person['position'][2]+person['position'][1])
                    # Calculate box_radius
                    if (person['depth'][0] == person['depth'][1]) and \
                        (person['depth'][2] == person['depth'][3]): # horizontal
                        left = person['depth'][0]
                        right = person['depth'][3]
                        box_radius = (((phasor[0]+1)/2)*(right-left)+left)/2
                    elif (person['depth'][0] == person['depth'][3]) and \
                        (person['depth'][1] == person['depth'][2]): # vertical
                        up = person['depth'][1]
                        down = person['depth'][0]
                        box_radius = (((phasor[1]+1)/2)*(up-down)+down)/2
                    else:
                        print('cant handle this input (depth)')
                    # Build box
                    box = self.buildBox(center,box_radius)
                    if not self.checkValidBox(box):
                        continue
                 
                # {'id':<int>,'type':<str>,'position':(<x_start>,<y_start>,<x_end>,<y_end>),'depth':(<at_start>,<at_end>),'speed':<px/s>,'start':<time_start_s>,'end':<time_end_s>}s
                if person['type'] == 'line':
                    dx = person['position'][2]-person['position'][0]
                    dy = person['position'][3]-person['position'][1]
                    dd = person['depth'][1]-person['depth'][0]
                    length = math.sqrt(dx*dx+dy*dy)
                    # determine where in the current movement cycle the object would be
                    mv_ratio = (person['speed']*time)/length
                    mv_percent = mv_ratio%1
                    # Calculate box center and depth
                    if math.floor(mv_ratio)%2 == 0: # going from start to end
                        #start+dm
                        center = (person['position'][0]+dx*mv_percent,person['position'][1]+dy*mv_percent)
                        box_radius = person['depth'][0]+dd*mv_percent
                    else: # going from end to start
                        #end-dm
                        center = (person['position'][2]-dx*mv_percent,person['position'][3]-dy*mv_percent)
                        box_radius = person['depth'][1]-dd*mv_percent
                    # Build box
                    box = self.buildBox(center,box_radius)
                    if not self.checkValidBox(box):
                        continue
                    
                # {'id':<int>,'type':<str>,'position':(<x>,<y>),'depth':(<depth>),'start':<time_start_s>,'end':<time_end_s>}
                if person['type'] == 'point':
                    center = (person['position'][0],person['position'][1])
                    box_radius = person['depth']
                    box = self.buildBox(center,box_radius)
                    if not self.checkValidBox(box):
                        continue
                
                result = {'id':person['id'],'box':box,'confidence':None,'keypoints':None}
                results.append(result)
        return results



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
        logging.debug('Started')
        try:
            self.initObjects()
            self.createDetector()
            self.spinDetector()
        except:
            self.killSelf()
        finally:
            logging.debug('Shutting Down')
        
    def kill(self):
        self.job_queue.put({'type':'kill'})
        self.join()