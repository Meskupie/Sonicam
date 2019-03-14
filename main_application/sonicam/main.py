# =============
# Imports
# =============
import time
import numpy as np
import ctypes
import base64
import cv2
import json
import requests
from kbhit import KBHit

import threading as t
import multiprocessing as mp
from queue import Empty
import eventlet as e

from flask import Flask, render_template, jsonify, request
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
from measurement import FaceDetector, Tracker
from poi import POIManager
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
processes.append(FrameServer('FrameServer',queue_dict,shared_buffer_frames,shared_buffer_times,shared_buffer_index,shared_pyramid_frames))
processes.append(FaceDetector('FaceDetector',queue_dict,shared_buffer_frames,shared_pyramid_frames))
processes.append(Beamformer('Beamformer',queue_dict))

# =============
# Ready Control
# =============
ready_names = ['audio'] #AUDIO (remove defaut)
ready_names_required = ['face','audio']
def updateReady(name=None):
    if name != None:
        ready_names.append(name)
    for n in ready_names_required:
        if n not in ready_names:
            return False
    socket.emit('state','ready')
    return True

# =============
# Loading Control
# =============
loaded_names = ['audio'] #AUDIO (remove defaut)
loaded_names_required = ['camera','audio']
def updateLoaded(name=None):
    if name != None:
        loaded_names.append(name)
    logging.info('loaded_names '+str(loaded_names))
    logging.info('loaded_names '+str(loaded_names_required))
    for n in loaded_names_required:
        if n not in loaded_names:
            return False
    socket.emit('state','playing')
    start_stream()
    return True
def resetLoaded():
    global loaded_names
    loaded_names = ['audio'] #AUDIO (remove defaut)

# =============
# Stream Control
# =============
def ended_stream():
    tracker.reset()
    POIManager.reset()
    socket.emit('state','eof')

def stop_stream():
    tracker.reset()
    POIManager.reset()
    requests.post(param_audio_url+"/state", json={'state':'stop'})
    queue_dict['frame_server'].put({'type':'stop'})

def load_stream(file):
    resetLoaded()
    requests.post(param_audio_url+"/fname", json={'fname':file})
    queue_dict['frame_server'].put({'type':'load','src':param_src_video_path+file+param_src_video_suffix})

def start_stream():
    requests.post(param_audio_url+"/state", json={'state':'start'})
    queue_dict['frame_server'].put({'type':'start'})

# =============
# Main application
# =============
tracker = Tracker()
poi_manager = POIManager()
add_chin = False

def emitBeamformer():
    requests.post(param_audio_url+"/data",json=POIManager.getBeamformer())
    
def emitFullFrame(frame_raw,tracks):
    frame = cv2.resize(frame_raw,param_full_output_shape,interpolation = cv2.INTER_NEAREST)#interpolation = cv2.INTER_AREA)
    scale = frame.shape[0]/param_frame_shape[0]
    for track in tracks:
        state = track.location
        bb = Tracker.boundingBoxFromState(state)
        bb = [int(round(x*scale)) for x in bb]
        cv2.rectangle(frame,(bb[0], bb[1]),(bb[0]+bb[2], bb[1] + bb[3]),(0,155,255),1)

    ret, frame_encoded = cv2.imencode('.jpg',frame)
    frame_string = base64.b64encode(frame_encoded).decode('utf8')
    socket.emit('frame',frame_string)

def emitFeeds(feeds):    
    socket.emit('feeds',json.dumps(feeds))

def spinServiceJobs(flag,job_queue):
    time_last = 0
    running_chain = False
    run_detection = False
    detection = []
    while flag.value == 1:
        try:
            job = job_queue.get_nowait()
        except Empty:
            e.sleep(1.0/param_flask_queue_spin_rate)
        else:
            try:
                if job['type'] == 'ready':
                    logging.debug('Ready from '+str(job['src']))
                    if job['src'] == 'FaceDetector':
                        updateReady('face')

                elif job['type'] == 'loaded':
                    logging.info('Loaded from '+str(job['src']))
                    if job['src'] == 'CameraReader':
                        updateLoaded('camera')

                elif job['type'] == 'eof':
                    ended_stream()

                elif job['type'] == 'new_frame':
                    if running_chain == False:
                        running_chain = True
                        run_detection = True
                    
                    # Start next detection
                    if run_detection:
                        run_detection = False
                        queue_dict['face_detector'].put({'type':'detect'})

                    tracker.predictionUpdate(job['frame_time'])

                    if job['buffer_index']%param_output_every == 0:
                        poi_manager.updateFromTracker(tracker.track_filters,shared_buffer_frames[job['buffer_index']][1])
                        
                        if param_output_style == 'full':
                            emitFullFrame(shared_buffer_frames[job['buffer_index']][1],tracker.track_filters)
                        elif param_output_style == 'feeds':
                            emitFeeds(poi_manager.getFeeds())
                            if add_chin:
                                emitFullFrame(shared_buffer_frames[job['buffer_index']][1],tracker.track_filters)
                    
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
                    
                    if job['buffer_index'] != None:
                        # Run measurement update on face results
                        tracker.measurementUpdate(job['frame_time'],job['results'])

                        # Update POI thumbnails as well as updateing tracks
                        poi_manager.updateFromDetection(tracker.track_filters,shared_buffer_frames[job['buffer_index']][1])
                        
                        # Unlock frame
                        queue_dict['frame_server'].put({'type':'unlock_frame','buffer_index':job['buffer_index']})
                        
                    # Flag to run next detection
                    run_detection = True
                
                else:
                    logging.error('Unknown job type')
                    
            except KeyError as exception:
                        logging.error('Could not service video driver job with tag: '+str(exception))
    
    
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

# =============
# Setup Flask
# =============
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socket = SocketIO(app)#, logger=True, engineio_logger=True)

@app.route('/')
def index():
    if param_output_style == 'feeds':
        return render_template('index2.html')
    elif param_output_style == 'full':
        return render_template('index.html')

@app.route('/api/pois/', methods=['GET','POST'])
def poi_url():
    if request.method == 'GET':
        output = poi_manager.getPOIs()
        return jsonify(output)
    elif request.method == 'POST':
        data = request.get_json()
        poi_manager.updateFromUIChange(data)
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
    else:
        logging.error('Unknown API call to /api/pois/ ('+str(request.method)+')')
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}

@app.route('/api/pois/<int:poi_id>/', methods=['GET','POST'])
def poi_id_url(poi_id):
    if request.method == 'GET':
        output = poi_manager.getPOIs(specific=poi_id)
        return jsonify(output)
    elif request.method == 'POST':
        data = request.get_json()
        poi_manager.updateFromPOIChange(poi_id,data)
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
    else:
        logging.error('Unknown API call to /api/pois/id ('+str(request.method)+')')
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}

@app.route('/api/poisverbose/', methods=['GET'])
def poiverbose_url():
    if request.method == 'GET':
        output = poi_manager.getPOIs(verbose=True)
        return jsonify(output)

@app.route('/api/files/', methods=['GET','POST'])
def files_url():
    if request.method == 'GET':
        # Reset the currently running stream
        stop_stream()
        updateReady()
        return jsonify(param_src_files)
    elif request.method == 'POST':
        file = request.get_json()
        stop_stream()
        load_stream(file)
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
    else:
        logging.error('Unknown API call to /api/files ('+str(request.method)+')')
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}

@app.route('/api/audiostate/', methods=['POST'])
def audiostate_url():
    if request.method == 'POST':
        data = request.get_json()
        if data['state'] == 'ready':
            updateReady('audio')
        elif data['state'] == 'loaded':
            updateLoaded('audio')
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
    else:
        logging.error('Unknown API call to /api/audiostate ('+str(request.method)+')')
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}

@app.route('/api/uisettings/', methods=['POST'])
def uisettings_url():
    global add_chin
    if request.method == 'POST':
        data = request.get_json()
        add_chin = data['chin']
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
    else:
        logging.error('Unknown API call to /api/audiostate ('+str(request.method)+')')
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}

if __name__ == '__main__':
    running_flag = mp.Value(ctypes.c_ubyte)
    running_flag.value = 1
    
    threads = []
    threads.append(e.spawn(spinServiceJobs,running_flag,queue_dict['master']))
    threads.append(e.spawn(waitForInput,running_flag,threads))

    # Force start file
    if param_src_force:
        logging.info('Loading file in headless mode')
        while not updateReady():
            logging.debug('Waiting for ready')
            e.sleep(0.1)
        logging.debug('Ready')
        load_stream(param_src_files[param_src_file_i])
        while not updateLoaded():
            logging.debug('Waiting for loaded')
            e.sleep(0.1)
        logging.debug('Playing')

    # Start webserver    
    try:
        socket.run(app, host='127.0.0.1')
    finally:
        killSystem(running_flag,threads,processes)