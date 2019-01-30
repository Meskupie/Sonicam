import os
import cv2
import time
import base64
import multiprocessing as mp

import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template
from flask_socketio import SocketIO

# shared_vars['buffer_frames'][job['buffer_index']][1]
# queue_dict['frame_server'].put({'type':'unlock_frame','buffer_index':job['buffer_index']})
        
class WebServer(mp.Process):
    def __init__(self,name,queues,buffer_frames):
        super(WebServer,self).__init__()
        self.name = name

        # Grab references to linking data
        self.queue_dict = queues
        global shared_vars
        shared_vars['buffer_frames'] = buffer_frames
        
        # Start the Process
        self.start()
        
    def run(self):
        basedir = os.path.abspath(os.path.dirname(__file__))
        
        # Create flask app
        self.app = Flask(__name__,template_folder=os.path.join(basedir,'templates/'))
        self.app.config['SECRET_KEY'] = 'secret!'
        
        # Add URLs
        self.app.add_url_rule('/', 'index', self.URLIndex)
        
        # Create socket
        self.socket = SocketIO(self.app)
        
        eventlet.spawn(self.sending)
        eventlet.spawn(self.startServer)
        time.sleep(30)
        
        
    def webServerThread(self):
        self.socket.run(app, host='127.0.0.1')

    def sampleVideoThread(self):
        while not kill_all:
            cap = cv2.VideoCapture('../data/sample_video.mp4')
            while not kill_all and cap.isOpened():
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
    
    def URLIndex(self):
        return render_template('index.html')