import time
import numpy as np
import ctypes
import matplotlib.pyplot as plt
import cv2


import threading as t
import multiprocessing as mp

#from gevent import monkey
#monkey.patch_all(thread=False)#, socket=False)
import eventlet
eventlet.monkey_patch(thread=False)

# =============
# Setup logging
# =============
import logging
from multiprocessing_logging import install_mp_handler

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(processName)s: [%(levelname)s] %(message)s',
                    #filename='log/sonicam.log',
                    #filemode='w'
                    )
install_mp_handler()

# =============
# Import internal libraries
# =============
from parameters import *
from frameserver import FrameServer
from measurement import FaceDetector
#from webserver import WebServer

# =============
# Set up a dictionary of queues to be used in message excange between processes
# =============
queue_dict = {}
queue_dict['main'] = mp.Queue()
queue_dict['frame_server'] = mp.Queue()
queue_dict['face_detector'] = mp.Queue()
queue_dict['web_server'] = mp.Queue()
queue_dict['tracker'] = mp.Queue()

# =============
# Create all of the shared memory structures to pass data between processes
# =============
# Frame buffer
raw_frame_arrays = [mp.Array(ctypes.c_ubyte,int(np.prod(param_frame_shape))) for _ in range(param_image_buffer_length)]
shared_buffer_frames = [(array,np.frombuffer(array.get_obj(),dtype=np.uint8).reshape(param_frame_shape)) for array in raw_frame_arrays]
# Frame buffer times
raw_time_array = mp.Array(ctypes.c_double,param_image_buffer_length)
shared_buffer_times = (raw_time_array,np.frombuffer(raw_time_array.get_obj(),dtype=np.double))
# Frame buffer index
shared_buffer_index = mp.Value(ctypes.c_ubyte)
# Pyramid buffer
raw_pyramid_arrays = [mp.Array(ctypes.c_ubyte,int(round(np.prod(shape)))) for shape in param_pyramid_shapes]
shared_pyramid_frames = [(raw_pyramid_arrays[i],np.frombuffer(raw_pyramid_arrays[i].get_obj(),dtype=np.uint8).reshape(param_pyramid_shapes[i])) for i in range(len(raw_pyramid_arrays))]

# =============
# Initialize processes
# =============
src = '../data/sample_video.mp4' # None
video_driver = FrameServer('FrameServer',src,queue_dict,shared_buffer_frames,shared_buffer_times,shared_buffer_index,shared_pyramid_frames)
face_detector = FaceDetector('FaceDetector',queue_dict,shared_buffer_frames,shared_pyramid_frames)
#web_server = WebServer('WebServer',queue_dict,shared_buffer_frames)

# =============
# Thread for killing program on enter
# =============
def waitForInput(queue):
    input()
    queue.put({'type':'kill'})
t.Thread(target=waitForInput,daemon=True,args=(queue_dict['main'],)).start()


time_last = 0
# =============
# Main loop
# =============
while True:
    job = queue_dict['main'].get()
    try:
        if job['type'] == 'kill':
            logging.info('kill1')
            video_driver.kill()
            logging.info('kill2')
            face_detector.kill()
            logging.info('kill3')
            #web_server.kill()
            logging.info('kill4')
            break
        
        elif job['type'] == 'state':
            if job['state'] == 'rolling':
                logging.debug('Starting chain')
                queue_dict['face_detector'].put({'type':'detect'})
        
        elif job['type'] == 'face_detector_results':
            results = job['results']
            time_now = time.time()
            if time_last != 0:
                logging.info('Detection Frequency: '+str(round(1/(time_now-time_last),2))+' Hz. Found: '+str(len(results)))
            time_last = time_now
            
            queue_dict['frame_server'].put({'type':'unlock_frame','buffer_index':job['buffer_index']})
            
            queue_dict['face_detector'].put({'type':'detect'})
        
        else:
            logging.error('Unknown job type')
            
    except KeyError as e:
                logging.error('Could not service video driver job with tag: '+str(e))

