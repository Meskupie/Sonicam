import cv2
import time
import logging
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
        self.web_server_queue = queues['web_server']
        
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
                        logging.error('Detection Frequency: '+str(round(1/(time_now-time_last),2))+' Hz. Found: '+str(len(results)))
                    time_last = time_now
                    
                    self.web_server_queue.put({'type':'full_frame','buffer_index':job['buffer_index'],'results':job['results']})
                    
                    self.face_detector_queue.put({'type':'detect'})
                
                else:
                    logging.error('Unknown job type')
                    
            except KeyError as e:
                        logging.error('Could not service video driver job with tag: '+str(e))
      
    
    def killSelf(self):
        pass
    
    def run(self):
        logging.debug('Started')
        try:
            self.spinServiceJobs()
        except:
            self.killSelf()
        finally:
            logging.debug('Shutting Down')
        
    # External kill command
    def kill(self):
        self.job_queue.put({'type':'kill'})
        self.join()