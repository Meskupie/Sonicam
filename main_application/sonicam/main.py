# =============
# Imports
# =============
import time
import numpy as np
import ctypes
import base64
import cv2
import json
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
from audio import Beamformer

# =============
# Set up a dictionary of queues to be used in message excange between processes
# =============
queue_dict = {}
queue_dict['master'] = mp.Queue()
queue_dict['frame_server'] = mp.Queue()
queue_dict['face_detector'] = mp.Queue()
queue_dict['beamformer'] = mp.Queue()

# =============
# Create all of the shared memory structures to pass data between processes
# =============
# Frame buffer
raw_frame_arrays = [mp.Array(ctypes.c_ubyte,int(np.prod(param_frame_shape))) for _ in range(param_image_buffer_length)]
shared_buffer_frames = [(array,np.frombuffer(array.get_obj(),dtype=np.uint8).reshape(param_frame_shape)) for array in raw_frame_arrays]
raw_time_array = mp.Array(ctypes.c_double,param_image_buffer_length)
shared_buffer_times = (raw_time_array,np.frombuffer(raw_time_array.get_obj(),dtype=np.double))
shared_buffer_index = mp.Value(ctypes.c_ubyte)

# Pyramid buffer
raw_pyramid_arrays = [mp.Array(ctypes.c_ubyte,int(round(np.prod(shape)))) for shape in param_pyramid_shapes]
shared_pyramid_frames = [(raw_pyramid_arrays[i],np.frombuffer(raw_pyramid_arrays[i].get_obj(),dtype=np.uint8).reshape(param_pyramid_shapes[i])) for i in range(len(raw_pyramid_arrays))]

# Thumbnail buffer
#raw_frame_arrays = [mp.Array(ctypes.c_ubyte,int(np.prod(param_thumbnail_shape))) for _ in range(param_thumbnail_count)]
#shared_buffer_frames = [(array,np.frombuffer(array.get_obj(),dtype=np.uint8).reshape(param_frame_shape)) for array in raw_frame_arrays]

# =============
# Initialize processes
# =============
processes = []
processes.append(FrameServer('FrameServer',param_src,queue_dict,shared_buffer_frames,shared_buffer_times,shared_buffer_index,shared_pyramid_frames))
processes.append(FaceDetector('FaceDetector',queue_dict,shared_buffer_frames,shared_pyramid_frames))
processes.append(Beamformer('Beamformer',queue_dict))


# =============
# Setup Flask
# =============
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socket = SocketIO(app)#, logger=True, engineio_logger=True)

@app.route('/')
def index():
    return render_template('index2.html')


# =============
# Main application logic
# =============
tracker = Tracker()

def getAngle(results):
    return 30.0*math.sin(time.time())

def spinServiceJobs(flag,job_queue):
    time_last = 0
    running_chain = False
    detection = []
    while flag.value == 1:
        try:
            job = job_queue.get_nowait()
        except Empty:
            e.sleep(1.0/param_flask_queue_spin_rate)
        else:
            try:
                if job['type'] == 'new_frame':
                    if running_chain == False:
                        running_chain = True
                        logging.info('Starting chain')
                        queue_dict['face_detector'].put({'type':'detect'})
                        
                    #tracker.predictionUpdate(job['frame_time'])
                    #estimation = tracker.getEstimation()
                    
                    if job['buffer_index']%param_output_every == 0:
                        if param_output_style == 'full':
                            emitFullFrame(shared_buffer_frames[job['buffer_index']][1],detection)
                            
                            #angle = getAngle(estimation)
                            #queue_dict['beamformer'].put({'type':'angle','angle':angle})
                        
                        elif param_output_style == 'thumbnails':
                            emitThumbnails(shared_buffer_frames[job['buffer_index']][1],detection)
                    
                elif job['type'] == 'face_results':
                    # Record the frame rate
                    time_now = time.time()
                    if time_last != 0:
                        logging.info('Detection Frequency: '+str(round(1/(time_now-time_last),2))+' Hz. Found: '+str(len(job['results'])))
                        assert job['buffer_index'] != None
                    else:
                        logging.info('Detection Frequency: First Frame')
                        assert job['buffer_index'] == None
                    time_last = time_now
                    
                    # Run measurement update on face results
                    #tracker.measurementUpdate(job['frame_time'],job['results'])
                    
                    # Run next detection
                    queue_dict['face_detector'].put({'type':'detect'})
                    
                    if job['buffer_index'] != None:
                        detection = job['results']
                        
                        if param_output_style == 'detections':
                            emitFullFrame(shared_buffer_frames[job['buffer_index']][1],detection)
                            
                        elif param_output_style == 'thumbnail_detections':
                            emitThumbnails(shared_buffer_frames[job['buffer_index']][1],detection)
                        
                        queue_dict['frame_server'].put({'type':'unlock_frame','buffer_index':job['buffer_index']})
                        
                else:
                    logging.error('Unknown job type')
                    
            except KeyError as exception:
                        logging.error('Could not service video driver job with tag: '+str(exception))
                        

def encodeFrame(frame):
    ret, frame_encoded = cv2.imencode('.jpg',frame)
    frame_string = base64.b64encode(frame_encoded).decode('utf8')
    return frame_string
    

def emitFullFrame(frame_raw,detection=[]): #detection=job['results']
    frame_scaled = cv2.resize(frame_raw,param_full_output_shape,interpolation = cv2.INTER_NEAREST)#interpolation = cv2.INTER_AREA)
    if detection == None:
        frame = frame_scaled
    else:
        frame = addDetectionToFrame(frame_scaled,detection)
    frame_string = encodeFrame(frame)
    socket.emit('image',frame_string)

def emitThumbnails(frame_raw,detection):
    #measure,measure_transformed = Tracker.measureStateEstimate(detection)
    
    face_scales = np.zeros(len(detection))
    for i,poi in enumerate(detection):
        bb = poi['box']
        face_scales[i] = int(round((bb[2]+bb[3])/2)*param_thumbnail_scale)
    sorted_detection = [detection[i] for i in np.flip(np.argsort(face_scales))]
    
    id_counter = 0
    thumbnail_list = []
    for poi in sorted_detection:
        #bb = Tracker.calculateBoundingBox(m)
        bb = poi['box']
        w = int(round((bb[2]+bb[3])/2)*param_thumbnail_scale)
        cx = int(round(bb[0]+(bb[2]/2)))
        cy = int(round(bb[1]+(bb[3]/2)))
        
        c = np.zeros(4)
        c[0] = int(round((cx-w/2)))
        c[1] = int(round((cy-w/2)))
        c[2] = int(round((cx+w/2)))
        c[3] = int(round((cy+w/2)))
        
        # Caluclate indexs in the thumbnail that the scaled video will occupy.
        # Fill remaining area with specified colour
        nx = np.zeros(2,dtype=int)
        nx[0] = int(round(param_thumbnail_shape[0]*((max(c[0],0)-c[0])/(c[2]-c[0]))))
        nx[1] = int(param_thumbnail_shape[0]-round(param_thumbnail_shape[0]*((c[2]-min(c[2],1920))/(c[2]-c[0]))))
        ny = np.zeros(2,dtype=int)
        ny[0] = int(round(param_thumbnail_shape[1]*((max(c[1],0)-c[1])/(c[3]-c[1]))))
        ny[1] = int(param_thumbnail_shape[0]-round(param_thumbnail_shape[1]*((c[3]-min(c[3],1080))/(c[3]-c[1]))))
        
        output_shape = (nx[1]-nx[0],ny[1]-ny[0])
        input_shape = frame_raw[int(max(c[1],0)):int(min(c[3],1080)),int(max(c[0],0)):int(min(c[2],1920)),:].shape
        if output_shape[0] == 0 or output_shape[1] == 0:
            logging.warning('Skipping thumbnail with output shape: '+str(output_shape))
            continue
        if input_shape[0] == 0 or input_shape[1] == 0 or input_shape[2] == 0:
            logging.warning('Skipping thumbnail with input shape: '+str(input_shape))
            logging.warning(c)
            continue
        
        out = np.array([[param_thumbnail_background]],dtype=np.uint8)
        out = np.repeat(out,param_thumbnail_shape[0],axis=0)
        out = np.repeat(out,param_thumbnail_shape[0],axis=1)
        out[ny[0]:ny[1],nx[0]:nx[1],:] = cv2.resize(frame_raw[int(max(c[1],0)):int(min(c[3],1080)),int(max(c[0],0)):int(min(c[2],1920)),:],output_shape,interpolation = cv2.INTER_AREA)
        
        thumbnail_list.append({'id':id_counter,'image':encodeFrame(out)})
        id_counter += 1
    
    socket.emit('thumbnails',json.dumps(thumbnail_list))

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
        logging.warning('Killing threads')
        for thread in threads:
            thread.kill()
        for process in processes:
            logging.warning('Killing Process: '+process.name)
            process.kill()



if __name__ == '__main__':
    running_flag = mp.Value(ctypes.c_ubyte)
    running_flag.value = 1
    
    threads = []
    threads.append(e.spawn(spinServiceJobs,running_flag,queue_dict['master']))
    threads.append(e.spawn(waitForInput,running_flag,threads))
    
    try:
        socket.run(app, host='127.0.0.1')
    finally:
        killSystem(running_flag,threads,processes)
        
        
        
# # =============
# # Setup Flask
# # =============
# app = Flask(__name__)
# app.config['SECRET_KEY'] = 'secret!'
# socket = SocketIO(app)#, logger=True, engineio_logger=True)

# @app.route('/')
# def index():
#     return render_template('index.html')
    
# def spinServiceJobs(flag,job_queue):
#     while flag.value == 1:
#         try:
#             job = job_queue.get_nowait()
#         except Empty:
#             e.sleep(1.0/param_flask_queue_spin_rate)
#         else:
#             if job['type'] == 'full_frame':
#                 frame = addDetectionToFrame(shared_buffer_frames[job['buffer_index']][1],job['results'])
#                 ret, frame_encoded = cv2.imencode('.jpg',frame)
                
#                 queue_dict['frame_server'].put({'type':'unlock_frame','buffer_index':job['buffer_index']})
                
#                 frame_string = base64.b64encode(frame_encoded).decode('utf8')
#                 socket.emit('image',frame_string)
        
# def waitForInput(running_flag,threads):
#     kb = KBHit()
#     while True:
#         if kb.kbhit():
#             c = kb.getch()
#             if ord(c) == 27: # ESC
#                 break
#         e.sleep(0.1)
#     kb.set_normal_term()
    
#     socket.stop()
    
# def killSystem(flag,threads,processes):
#     if flag.value == 1:
#         logging.warning('System terminating')
#         flag.value = 0
#         for thread in threads:
#             thread.kill()
#         for process in processes:
#             process.kill()

# if __name__ == '__main__':
#     running_flag = mp.Value(ctypes.c_ubyte)
#     running_flag.value = 1
    
#     threads = []
#     threads.append(e.spawn(spinServiceJobs,running_flag,queue_dict['web_server']))
#     threads.append(e.spawn(waitForInput,running_flag,threads))
    
#     try:
#         socket.run(app, host='127.0.0.1')
#     finally:
#         killSystem(running_flag,threads,processes)