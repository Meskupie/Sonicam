import os
import cv2
import time
import base64
#import multiprocessing as mp
import logging
import queue as q

from flask import Flask, render_template
from flask_socketio import SocketIO

from parameters import *

import eventlet
#eventlet.monkey_patch()
eventlet.monkey_patch(thread=False)

# shared_vars['buffer_frames'][job['buffer_index']][1]
# queue_dict['frame_server'].put({'type':'unlock_frame','buffer_index':job['buffer_index']})
        
class WebServer():#mp.Process):
    def __init__(self,name,queues):#,buffer_frames):
        #super(WebServer,self).__init__()
        self.name = name
        # Grab references to linking data
        self.main_queue = queues['main']
        self.job_queue = queues['web_server']
        #global shared_vars
        #shared_vars['buffer_frames'] = buffer_frames
        
        # Start the Process
        #self.start()
        self.run()
        
    def run(self):
        
        logging.info('here-2')
        #basedir = os.path.abspath(os.path.dirname(__file__))
        # Create flask app
        self.app = Flask(__name__) #os.path.join(basedir,'templates/'))
        #self.app.config['SECRET_KEY'] = 'secret!'
        logging.info('here-1')
        # Add URLs
        self.app.add_url_rule('/', 'index', self.index)

        logging.info('here0')
        # Create socket
        self.socket = SocketIO(self.app)

        self.threads = []
        logging.info('here1')
        t1 = eventlet.spawn(self.sampleVideoThread)
        self.threads.append(t1)
        
        logging.info('here2')
        self.threads.append(eventlet.spawn(self.webServerThread))
        logging.info('here3')
        self.spinServiceJobs()
        logging.info('here4')
        
    def spinServiceJobs(self):
        while True:
            job = self.job_queue.get()

            if job['type'] == 'kill': # The message to kill the thread
                logging.info('made it')
                self.killSelf()
                break
            
            elif job['type'] == 'draw':
                pass
                
            else:
                logging.error('Unknown job')
        
        
    def webServerThread(self):
        print('LALALALA')
        logging.info('socket starting')
        self.socket.run(self.app, host='127.0.0.1')

    def sampleVideoThread(self):
        print('HAHAHA')
        logging.info('video starting')
        import eventlet
        eventlet.monkey_patch()
        while True:
            cap = cv2.VideoCapture('../data/sample_video.mp4')
            while cap.isOpened():
                time_s = time.time()
                ret,frame = cap.read()
                if not ret: break
                frame = cv2.resize(frame,(960,540))
                frame = cv2.flip(frame, -1)
                ret, frame_encoded = cv2.imencode('.jpg',frame)
                frame_string = base64.b64encode(frame_encoded).decode('utf8')
                self.socket.emit('image',frame_string)
                hz = 10#cap.get(cv2.CAP_PROP_FPS)
                eventlet.sleep(max(0,(1/hz)-(time.time()-time_s)))
        
    def addDetectionToFrame(self,frame,detection):
        scale = frame.shape[0]/param_frame_shape[0]
        for result in detection:
            bb = [int(round(x*scale)) for x in result['box']]
            kp = result['keypoints']
            cv2.rectangle(frame,(bb[0], bb[1]),(bb[0]+bb[2], bb[1] + bb[3]),(0,155,255),2)
            cv2.circle(frame,tuple(int(round(x*scale)) for x in kp['left_eye']), 1, (0,0,255), 2)
            cv2.circle(frame,tuple(int(round(x*scale)) for x in kp['right_eye']), 1, (0,0,255), 2)
            cv2.circle(frame,tuple(int(round(x*scale)) for x in kp['nose']), 1, (0,0,255), 2)
            cv2.circle(frame,tuple(int(round(x*scale)) for x in kp['mouth_left']), 1, (0,255,0), 2)
            cv2.circle(frame,tuple(int(round(x*scale)) for x in kp['mouth_right']), 1, (0,255,0), 2)
        return frame
    
    def index(self):
        return render_template('index.html')
        
    def killSelf(self):
        logging.info('dang')
        #self.socket.stop()
        logging.info('socket stopped')
        for thread in self.threads:
            thread.stop()
            logging.info('thread stopped')
    
    def kill(self):
        self.job_queue.put({'type':'kill'})
        self.join()
        logging.info('killed web')


import ctypes
import numpy as np

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(processName)s: [%(levelname)s] %(message)s',
                    #filename='log/sonicam.log',
                    #filemode='w'
                    )

logging.info('here')

queue_dict = {}
# queue_dict['main'] = mp.Queue()
# queue_dict['frame_server'] = mp.Queue()
# queue_dict['face_detector'] = mp.Queue()
# queue_dict['web_server'] = mp.Queue()
# queue_dict['tracker'] = mp.Queue()
queue_dict['main'] = q.Queue()
queue_dict['web_server'] = q.Queue()

# Frame buffer
# raw_frame_arrays = [mp.Array(ctypes.c_ubyte,int(np.prod(param_frame_shape))) for _ in range(param_image_buffer_length)]
# shared_buffer_frames = [(array,np.frombuffer(array.get_obj(),dtype=np.uint8).reshape(param_frame_shape)) for array in raw_frame_arrays]
web_server = WebServer('WebServer',queue_dict)#,shared_buffer_frames)

time.sleep(10)
web_server.kill()
