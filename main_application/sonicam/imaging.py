import numpy as np
import logging
import time

import multiprocessing as mp

import cv2
from parameters import *


# ===================================
#
# ===================================
class FrameServer(mp.Process):
    # Barebones initialization, pass shared data structures into the process and start it
    def __init__(self,name,src,queues,buffer_frames,buffer_times,buffer_index,pyramid_frames):
        super(FrameServer, self).__init__()
        self.name = name
        self.src = src
        
        # Grab references to linking data
        self.job_queue = queues['frame_server']
        self.master_queue = queues['master']
        self.face_detector_queue = queues['face_detector']
        
        global shared_vars
        shared_vars['buffer_frames'] = buffer_frames
        shared_vars['buffer_times'] = buffer_times
        shared_vars['buffer_index'] = buffer_index
        shared_vars['pyramid_frames'] = pyramid_frames
        
        # Start the Process
        self.start()
    
    # Initialize all objects that are used in the video driver
    def initObjects(self):
        # Event to signal stopping of all threads
        self.run_event = mp.Event()
        self.run_event.set()
        
        # Initialize buffer index so that the first frame goes in index 0
        self.local_buffer_index = param_image_buffer_length-1
        with shared_vars['buffer_index'].get_lock():
            shared_vars['buffer_index'].value = self.local_buffer_index
        
        # Objects for processing pool jobs
        self.image_job_queue = mp.Queue()
        self.buffer_index_locked = np.zeros(param_image_buffer_length)

        # State Variables
        self.is_rolling = False
    
    # Startup all processes and threads that run in the background
    def startWorkerProcesses(self):
        # Create Workers
        self.image_processing_workers = []
        for i in range(param_n_image_workers):
            name = 'ImageWorker-'+str(i+1)+'of'+str(param_n_image_workers)
            worker = ImageProcessingWorker(name,self.run_event,self.job_queue,self.image_job_queue,shared_vars['buffer_frames'],shared_vars['buffer_times'],shared_vars['buffer_index'],shared_vars['pyramid_frames'])
            self.image_processing_workers.append(worker)
    
    # Analyse the buffer index and the delta time between frames to verify that no frames were skipped
    # and that the current frame buffer is consistent.
    def updateBufferIndex(self,index):
        with shared_vars['buffer_index'].get_lock():
            prev_buffer_index = self.local_buffer_index # temp storage
            # update the local frame buffer index
            self.local_buffer_index = (self.local_buffer_index+1)%param_image_buffer_length
            if self.is_rolling:
                # Check if the index increment is consistent and we didnt skip frames
                if (index != self.local_buffer_index):
                    logging.error('[1] Frame de-sync (index) in camera driver')
                elif (shared_vars['buffer_index'].value != index):
                    logging.debug('Frame capture overran servicing indexs')
                # Check the time delta between frames to make sure we are not dropping frames
                with shared_vars['buffer_times'][0].get_lock():
                    dt = shared_vars['buffer_times'][1][self.local_buffer_index] - \
                        shared_vars['buffer_times'][1][prev_buffer_index]
                    if dt > param_frame_period*1.5:
                        logging.debug('Long time between frames: '+str(dt))
    
    # Using the lookup_time, find the coresponding buffer index to provide. Lock this index if not already locked. If the coresponding time is farther back than what is available in the first n-m buffer indexs (leaving the last m indexs available for new frames)
    def getBufferIndex(self,lookup_time,lock=True):
        with shared_vars['buffer_times'][0].get_lock():
            if lookup_time != None:
                found_index = (np.abs(shared_vars['buffer_times'][1]-lookup_time)).argmin()
                #dt = shared_vars['buffer_times'][1][found_index]-lookup_time
                # Check if the found index is too close to the end of the buffer
                delta_index = (self.local_buffer_index-found_index)%param_image_buffer_length
                if (delta_index <= param_image_buffer_end) and (delta_index != 0):
                    return -1
            else:
                found_index = self.local_buffer_index
            # If this index isn't being used, grab a lock to the frame array
            if lock:
                if self.buffer_index_locked[found_index] == 0:
                    shared_vars['buffer_frames'][found_index][0].acquire()
                    self.buffer_index_locked[found_index] = 1
            return found_index, shared_vars['buffer_times'][1][found_index]
    
    # Free the buffer index lock. Determine the length of time that the buffer index was held for to ensure that there is enough end frame buffer available to be filled while indexs are locked
    def freeBufferIndex(self,index):
        if self.buffer_index_locked[index] != 0:
            # Find the lock durration and log if it is longer than the available space on the frame buffer
            dt = time.time()-shared_vars['buffer_times'][1][index]
            if dt >= (param_image_buffer_length-param_image_buffer_end)*param_frame_period:
                logging.error('Locked frame for longer than available buffer space: '+str(dt))
            shared_vars['buffer_frames'][index][0].release()
            self.buffer_index_locked[index] = 0
        else:
            logging.error('Attempt to free a buffer index that is not locked')
        
    # Read incomming jobs in the job_queue and service them based on 'type'
    def spinServiceJobs(self):
        while True:
            job = self.job_queue.get()
            try:
                # Service jobs that are allowed before we are rolling
                if job['type'] == 'kill':
                    self.killSelf()
                    break
                
                elif job['type'] == 'start':
                    # Create Camera Driver
                    name = 'CameraReader'
                    self.camera_driver_worker = ImageReadWorker(name,self.src,self.run_event,self.job_queue,shared_vars['buffer_frames'],shared_vars['buffer_times'],shared_vars['buffer_index'])
                
                elif job['type'] == 'camera':
                    self.updateBufferIndex(job['index'])
                    index, frame_time = self.getBufferIndex(None,lock=False)
                    logging.debug('Serviced frame captured at index '+str(job['index'])+' with current index '+str(shared_vars['buffer_index'].value))
                    self.master_queue.put({'type':'new_frame','buffer_index':index,'frame_time':frame_time})
                    
                elif job['type'] == 'lock_frame':
                    try: time = job['time']
                    except KeyError: time = None
                    self.getBufferIndex(time)
                    
                elif job['type'] == 'unlock_frame':
                    self.freeBufferIndex(job['buffer_index'])
                    logging.debug('Unlocking index: '+str(job['buffer_index']))
                
                elif job['type'] == 'pyramid':
                    try: time = job['time']
                    except KeyError: time = None
                    index, frame_time = self.getBufferIndex(time)
                    logging.debug('Locking index: '+str(index)+', with time: '+str(frame_time))
                    if index == -1:
                        logging.error('Overran buffer, not enough history')
                    else:
                        for patterns in job['patterns']:
                            self.image_job_queue.put({'type':'pyramid','patterns':patterns,'buffer_index':index,'frame_time':frame_time})
                
                elif job['type'] == 'pyramid_ack':
                    self.face_detector_queue.put({'type':'pyramid_data','pyramid_index':job['pyramid_index'],'buffer_index':job['buffer_index'],'frame_time':job['frame_time']})
                
                elif job['type'] == 'thumbnail':
                    pass
                    
                elif job['type'] == 'error':
                    logging.error(job['message'])
                # {'type':'scale','shapes':((h,w),),'time':(None/time.time()),'pipe':connector}
                # if job['type'] == 'scale':
                #     # try / except in case there is no 'time' key
                #     try: time = job['time']
                #     except KeyError: time = None
                #     index = self.getBufferIndex(time,len(job['shapes']))
                #     if index == -1:
                #         job['pipe'].send({'type':'error','message':'Not enough history in the buffer'})
                #     else:
                #         for shape in job['shapes']:
                #             image_job = {'type':'scale','shape':shape,'buffer_index':index, \
                #                 'pipe':job['pipe']}
                #             self.image_job_queue.put(image_job)
                
                #{'type':'crop','loctions':(((x0,y0),(x1,y1)),),'shape':(h,w), \
                #'time':(None/time.time()),'pipe':connector}
                # elif job['type'] == 'crop':
                #     # try / except in case there is no 'time' key
                #     try: time = job['time']
                #     except KeyError: time = None
                #     index = self.getBufferIndex(time,len(job['locations']))
                #     if index == -1:
                #         job['pipe'].send({'type':'error','message':'Not enough history in the buffer'})
                #     else:
                #         for location in job['locations']:
                #             image_job = {'type':'crop','location':location,'shape':job['shape'], \
                #                 'buffer_index':index,'pipe':job['pipe']}
                #             self.image_job_queue.put(image_job)
                
                # elif job['type'] == 'acknowledge':
                #     if job['location'] == 'processing':
                #         self.freeBufferIndex(job['index'])
                
                else:
                    logging.error('Unknown job type')

            except KeyError as e:
                logging.error('Could not service job with tag: '+str(e))
    
    # Kill off all worker processes and wait until they are all dead
    def killPoolWorkers(self):
        self.image_job_queue.put({'type':'kill'})
        for worker in self.image_processing_workers:
            worker.join() # wait till they are all done executing
    
    # Kill all child processes and wait until they are all dead
    def killSelf(self):
        self.run_event.clear()
        self.killPoolWorkers()
        self.camera_driver_worker.join()
        
    # This function is called when the main process is started 'self.start()'
    def run(self):
        logging.info('Starting Process')
        try:
            self.initObjects()
            self.startWorkerProcesses()
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

# ===================================
#
# ===================================
class ImageReadWorker(mp.Process):
    # Barebones initialization, pass shared data structures into the process and start it
    def __init__(self,name,src,run_event,parent_queue,buffer_frames,buffer_times,buffer_index):
        super(ImageReadWorker, self).__init__()
        self.name = name
        self.src = src
        self.run_event = run_event
        self.parent_queue = parent_queue
        
        global shared_vars
        shared_vars['buffer_frames'] = buffer_frames
        shared_vars['buffer_times'] = buffer_times
        shared_vars['buffer_index'] = buffer_index
        
        self.start()
    
    def newFrameToBuffer(self,frame):
        # Update buffer with new frame
        with shared_vars['buffer_index'].get_lock():
            shared_vars['buffer_index'].value = (int(shared_vars['buffer_index'].value)+1) %param_image_buffer_length
            buffer_index = int(shared_vars['buffer_index'].value)
            with shared_vars['buffer_frames'][buffer_index][0].get_lock():
                # Dump image data into buffer
                shared_vars['buffer_frames'][buffer_index][1][:] = frame
                with shared_vars['buffer_times'][0].get_lock():
                    shared_vars['buffer_times'][1][buffer_index] = time.time()
        return buffer_index
    
    def spinFrameCapture(self):
        while self.run_event.is_set():
            if True:
                self.cap = cv2.VideoCapture(self.src)
                hz = self.cap.get(cv2.CAP_PROP_FPS)
                logging.debug('Frame rate check: '+str(hz))
            while self.run_event.is_set() and self.cap.isOpened():
                start = time.time()
                ret,frame = self.cap.read()
                if not ret: break # broken video capture object
                if param_flip_video:
                    buffer_index = self.newFrameToBuffer(cv2.flip(frame, -1))
                else:
                    buffer_index = self.newFrameToBuffer(frame)
                logging.debug('Reporting frame captured to index '+str(buffer_index))
                self.parent_queue.put({'type':'camera','index':buffer_index})
                # Delay
                if not param_use_cam:
                    time.sleep(max(0,(1/hz)-(time.time()-start)))
                else:
                    # TODO: fix for when we have a real camera
                    pass
            if self.cap.isOpened():
                self.cap.release()
            else:
                logging.debug('Restarting capture')
                
    def killSelf(self):
        if self.cap.isOpened():
            self.cap.release()
    
    def run(self):
        logging.info('Starting Process')
        try:
            self.spinFrameCapture()
        except Exception as e:
            logging.error('Killed due to ' + str(e))
            self.killSelf()
        finally:
            logging.info('Shutting Down Process')
            
# ===================================
#
# ===================================
class ImageWriteWorker(mp.Process):
    # Barebones initialization, pass shared data structures into the process and start it
    def __init__(self,name,file_name,run_event,job_queue,buffer_frames):
        super(ImageWriteWorker, self).__init__()
        self.name = name
        self.file_name = file_name
        self.run_event = run_event
        self.job_queue = job_queue
        
        global shared_vars
        shared_vars['buffer_frames'] = buffer_frames
        
        self.start()
    
    def newFrameToBuffer(self,frame):
        # Update buffer with new frame
        with shared_vars['buffer_index'].get_lock():
            shared_vars['buffer_index'].value = (int(shared_vars['buffer_index'].value)+1) %param_image_buffer_length
            buffer_index = int(shared_vars['buffer_index'].value)
            with shared_vars['buffer_frames'][buffer_index][0].get_lock():
                # Dump image data into buffer
                shared_vars['buffer_frames'][buffer_index][1][:] = frame
                with shared_vars['buffer_times'][0].get_lock():
                    shared_vars['buffer_times'][1][buffer_index] = time.time()
        return buffer_index
    
    def spinFrameWriting(self):
        fourcc = cv2.VideoWriter_fourcc('.avi')
        writer = cv2.VideoWriter(self.file_name, fourcc, param_cam_fps,(param_frame_shape[1],param_frame_shape[0]), True)

        while self.run_event.is_set():
            job = job_queue.get()
            
            if True:
                writer.write(frame)
        
                
    def killSelf(self):
        if self.cap.isOpened():
            self.cap.release()
    
    def run(self):
        logging.info('Starting Process')
        try:
            self.spinFrameCapture()
        except Exception as e:
            logging.error('Killed due to ' + str(e))
            self.killSelf()
        finally:
            logging.info('Shutting Down Process')

# ===================================
#
# ===================================
class ImageProcessingWorker(mp.Process):
    # Barebones initialization, pass shared data structures into the process and start it
    def __init__(self,name,run_event,parent_queue,job_queue,buffer_frames,buffer_times,buffer_index,pyramid_frames):
        super(ImageProcessingWorker, self).__init__()
        self.name = name
        self.run_event = run_event
        self.parent_queue = parent_queue
        self.job_queue = job_queue
        
        global shared_vars
        shared_vars['buffer_frames'] = buffer_frames
        shared_vars['buffer_times'] = buffer_times
        shared_vars['buffer_index'] = buffer_index
        shared_vars['pyramid_frames'] = pyramid_frames
        
        self.start()
        
    def servicePyramid(self,job):
        completed = []
        for pattern in job['patterns']:
            for i,scale_i in enumerate(pattern):
                if scale_i not in completed:
                    if i == 0: # 'Run from base to',param_pyramid_shapes[scale_i],'store at',scale_i
                        frame = cv2.resize(shared_vars['buffer_frames'][job['buffer_index']][1],param_pyramid_shapes[scale_i][0:2][::-1],interpolation = cv2.INTER_AREA)
                    else: # 'Run from',pattern[i-1],'to',param_pyramid_shapes[scale_i],'store at',scale_i
                        frame = cv2.resize(shared_vars['pyramid_frames'][pattern[i-1]][1],param_pyramid_shapes[scale_i][0:2][::-1],interpolation = cv2.INTER_AREA)
                    with shared_vars['pyramid_frames'][scale_i][0].get_lock():
                            shared_vars['pyramid_frames'][scale_i][1][:] = frame
                    completed.append(scale_i)
                    self.parent_queue.put({'type':'pyramid_ack','pyramid_index':scale_i,'buffer_index':job['buffer_index'],'frame_time':job['frame_time']})
    
    def spinServiceJobs(self):
        while self.run_event.is_set():
            job = self.job_queue.get()
            
            if job['type'] == 'pyramid':
                self.servicePyramid(job)
            
            # {'type':'crop','loctions':(((x0,y0),(x1,y1)),),shape':(h,w),
            # 'buffer_index':int,'pipe':connector}
            elif job['type'] == 'crop':
                pass
            
            elif job['type'] == 'kill': # The message to kill the thread
                self.job_queue.put({'type':'kill'}) # Replaced used kill job
                break
                
            else:
                logging.error('Unknown job')

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
