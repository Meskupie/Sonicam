import cv2
import time
import logging
import math
import multiprocessing as mp

from parameters import *

class MasterQueue(mp.Process):
    def __init__(self,name,queues):
        super(MasterQueue,self).__init__()
        self.name = name

        # Grab references to linking data
        self.job_queue = queues['master']
        self.face_detector_queue = queues['face_detector']
        self.frame_server_queue = queues['frame_server']
        self.tracker_queue = queues['tracker']
        self.web_server_queue = queues['web_server']
        self.beamformer_queue = queues['beamformer']
        
        # Start the Process
        self.start()
        
        
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
                
                elif job['type'] == 'state':
                    if job['state'] == 'rolling':
                        logging.debug('Starting chain')
                        self.face_detector_queue.put({'type':'detect'})
                
                elif job['type'] == 'face_detector_results':
                    results = job['results']
                    time_now = time.time()
                    if time_last != 0:
                        pass
                        logging.info('Detection Frequency: '+str(round(1/(time_now-time_last),2))+' Hz. Found: '+str(len(results)))
                    else:
                        logging.info('Detection Frequency: First Frame')
                    time_last = time_now
                    
                    if param_output_style == 'measure':
                        self.web_server_queue.put({'type':'full_frame','buffer_index':job['buffer_index'],'results':job['results']})
                        
                    self.tracker_queue.put({'type':'mes_update','buffer_index':job['buffer_index'],'frame_time':job['frame_time'],'results':job['results']})
                        
                    self.face_detector_queue.put({'type':'detect'})
                    
                elif job['type'] == 'estimation':
                    if param_output_style == 'estimate':
                        self.web_server_queue.put({'type':'estimation','estimation':job['estimation'],'buffer_index':job['buffer_index']})
                    #logging.info(str(job['estimation']))
                
                else:
                    logging.error('Unknown job type')
                    
            except KeyError as e:
                        logging.error('Could not service video driver job with tag: '+str(e))
      
    
    def killSelf(self):
        pass
    
    def run(self):
        logging.info('Starting Process')
        try:
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