import os
import cv2
import time
import base64

import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template
from flask_socketio import SocketIO

#import matplotlib.pyplot as plt

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__,template_folder=os.path.join(basedir,'templates/'))
app.config['SECRET_KEY'] = 'secret!'
socket = SocketIO(app)#, logger=True, engineio_logger=True)

kill_all = False

def addDetectionToFrame(frame,detection,height=1080):
    scale = 1
    for result in detection:
        bounding_box = [int(round(x*scale)) for x in result['box']]
        keypoints = result['keypoints']

        cv2.rectangle(frame,
                      (bounding_box[0], bounding_box[1]),
                      (bounding_box[0]+bounding_box[2], bounding_box[1] + bounding_box[3]),
                      (0,155,255),
                      2)
        cv2.circle(frame,tuple(int(round(x*scale)) for x in keypoints['left_eye']), 1, (0,0,255), 2)
        cv2.circle(frame,tuple(int(round(x*scale)) for x in keypoints['right_eye']), 1, (0,0,255), 2)
        cv2.circle(frame,tuple(int(round(x*scale)) for x in keypoints['nose']), 1, (0,0,255), 2)
        cv2.circle(frame,tuple(int(round(x*scale)) for x in keypoints['mouth_left']), 1, (0,255,0), 2)
        cv2.circle(frame,tuple(int(round(x*scale)) for x in keypoints['mouth_right']), 1, (0,255,0), 2)
    return frame


@app.route('/')
def index():
    return render_template('index.html')


def sending():
    while not kill_all:
        cap = cv2.VideoCapture('test.mp4')
        while not kill_all and cap.isOpened():
            time_s = time.time()
            ret,frame = cap.read()
            if not ret: break
            frame = cv2.resize(frame,(960,540))
            frame = cv2.flip(frame, -1)
            ret, frame_encoded = cv2.imencode('.jpg',frame)
            frame_string = base64.b64encode(frame_encoded).decode('utf8')
            socket.emit('image',frame_string)
            hz = cap.get(cv2.CAP_PROP_FPS)
            print(hz)
            eventlet.sleep(max(0,(1/hz)-(time.time()-time_s)))
        #cap.close()
    print('closing')


if __name__ == '__main__':
    eventlet.spawn(sending)
    
    try:
        socket.run(app, host='127.0.0.1')
    except KeyboardInterrupt:
        print("here")
    finally:
        kill_all = True
        print("done")