# =============
# Imports
# =============
import time
import numpy as np
import ctypes
import base64
import cv2
from kbhit import KBHit

import threading as t
import multiprocessing as mp
from queue import Empty
import eventlet as e

from flask import Flask, render_template
from flask_socketio import SocketIO

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
logging.getLogger('socketio').setLevel(logging.ERROR)
logging.getLogger('engineio').setLevel(logging.ERROR)
install_mp_handler()

# =============
# Import internal libraries
# =============
from parameters import *
from imaging import FrameServer
from graphics import addDetectionToFrame
from measurement import FaceDetector, Tracker
from state import MasterQueue
from audio import Beamformer

# =============
# Set up a dictionary of queues to be used in message excange between processes
# =============
queue_dict = {}
queue_dict['master'] = mp.Queue()
queue_dict['frame_server'] = mp.Queue()
queue_dict['face_detector'] = mp.Queue()
queue_dict['tracker'] = mp.Queue()
queue_dict['web_server'] = mp.Queue()
queue_dict['beamformer'] = mp.Queue()

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
processes = []
processes.append(FrameServer('FrameServer',param_src,queue_dict,shared_buffer_frames,shared_buffer_times,shared_buffer_index,shared_pyramid_frames))
processes.append(FaceDetector('FaceDetector',queue_dict,shared_buffer_frames,shared_pyramid_frames))
processes.append(MasterQueue('MasterQueue',queue_dict))
processes.append(Tracker('Tracker',queue_dict))
processes.append(Beamformer('Beamformer',queue_dict))
#processes.append()

# =============
# Setup Flask
# =============
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socket = SocketIO(app)#, logger=True, engineio_logger=True)

@app.route('/')
def index():
    return render_template('index.html')

def getAngle(results):
    return 30.0*math.sin(time.time())

def encodeFrame(frame):
    ret, frame_encoded = cv2.imencode('.jpg',frame)
    frame_string = base64.b64encode(frame_encoded).decode('utf8')
    return frame_string

def spinServiceJobs(flag,job_queue):
    while flag.value == 1:
        try:
            job = job_queue.get_nowait()
        except Empty:
            e.sleep(1.0/param_flask_queue_spin_rate)
        else:
            if job['type'] == 'full_frame': # param_pyramid_scalings     = [ 2, 3, 5, 8,15,25]
                frame = addDetectionToFrame(shared_buffer_frames[job['buffer_index']][1],job['results'])
                frame_string = encodeFrame(frame)
                
                queue_dict['frame_server'].put({'type':'unlock_frame','buffer_index':job['buffer_index']})
                socket.emit('image',frame_string)
                
                angle = getAngle(job['results'])
                queue_dict['beamformer'].put({'type':'angle','angle':angle})
            
            elif job['type'] == 'estimation':
                frame_raw = shared_buffer_frames[job['buffer_index']][1]
                frame_raw = cv2.resize(frame_raw,param_output_shape,interpolation = cv2.INTER_NEAREST)#interpolation = cv2.INTER_AREA)
                frame = frame_raw#addEstimationToFrame(frame_raw,job['estimation'])
                frame_string = encodeFrame(frame)
                
                socket.emit('image',frame_string)
                
                angle = getAngle(job['estimation'])
                queue_dict['beamformer'].put({'type':'angle','angle':angle})
                
        
def waitForInput(running_flag,threads):
    kb = KBHit()
    while True:
        if kb.kbhit():
            c = kb.getch()
            if ord(c) == 27: # ESC
                break
        e.sleep(0.1)
    kb.set_normal_term()
    
    socket.stop()
    
def killSystem(flag,threads,processes):
    if flag.value == 1:
        logging.warning('System terminating')
        flag.value = 0
        for thread in threads:
            thread.kill()
        for process in processes:
            process.kill()

if __name__ == '__main__':
    running_flag = mp.Value(ctypes.c_ubyte)
    running_flag.value = 1
    
    threads = []
    threads.append(e.spawn(spinServiceJobs,running_flag,queue_dict['web_server']))
    threads.append(e.spawn(waitForInput,running_flag,threads))
    
    try:
        socket.run(app, host='127.0.0.1')
    finally:
        killSystem(running_flag,threads,processes)