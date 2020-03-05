import logging
import multiprocessing as mp

from parameters import *

class MasterQueue(mp.Process):
    def __init__(self,name,queues):
        super(MasterQueue,self).__init__()
        self.name = name

        # Grab references to linking data
        self.job_queue = queues['queue_name']
        
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
                
                elif job['type'] == 'job':
                    pass
                
                else:
                    logging.error('Unknown job type')
                    
            except KeyError as e:
                        logging.error('Could not service job with tag: '+str(e))
      
    
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