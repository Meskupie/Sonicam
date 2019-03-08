import os
import cv2
import time
import base64
import json

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


@app.route('/')
def index():
    return render_template('index.html', name='Michael')


def sending():
    while not kill_all:
        cap = cv2.VideoCapture('test.mp4')
        while not kill_all and cap.isOpened():
            time_s = time.time()
            ret,frame = cap.read()
            if not ret: break
            frame1 = frame[0:115,0:115,:]
            frame2 = frame[0:115,115:230,:]
            frame3 = frame[0:115,230:345,:]
            frame4 = frame[0:115,345:460,:]
            frame5 = frame[230:345,0:115,:]
            frame6 = frame[230:345,115:230,:]
            frame7 = frame[230:345,230:345,:]
            frame8 = frame[230:345,345:460,:]

            ret1, frame_encoded1 = cv2.imencode('.jpg',frame1)
            ret2, frame_encoded2 = cv2.imencode('.jpg',frame2)
            ret3, frame_encoded3 = cv2.imencode('.jpg',frame3)
            ret4, frame_encoded4 = cv2.imencode('.jpg',frame4)
            ret5, frame_encoded5 = cv2.imencode('.jpg',frame5)
            ret6, frame_encoded6 = cv2.imencode('.jpg',frame6)
            ret7, frame_encoded7 = cv2.imencode('.jpg',frame7)
            ret8, frame_encoded8 = cv2.imencode('.jpg',frame8)

            frame_string1 = base64.b64encode(frame_encoded1).decode('utf8')
            frame_string2 = base64.b64encode(frame_encoded2).decode('utf8')
            frame_string3 = base64.b64encode(frame_encoded3).decode('utf8')
            frame_string4 = base64.b64encode(frame_encoded4).decode('utf8')
            frame_string5 = base64.b64encode(frame_encoded5).decode('utf8')
            frame_string6 = base64.b64encode(frame_encoded6).decode('utf8')
            frame_string7 = base64.b64encode(frame_encoded7).decode('utf8')
            frame_string8 = base64.b64encode(frame_encoded8).decode('utf8')

            frames = {
                1: frame_string1,
                2: frame_string2,
                3: frame_string3,
                4: frame_string4,
                5: frame_string5,
                6: frame_string6,
                7: frame_string7,
                8: frame_string8
            }

            #socket.emit('image',frame_string4)
            #ret, frame_encoded = cv2.imencode('.jpg',frame)
            #frame_string = base64.b64encode(frame_encoded).decode('utf8')
            socket.emit('image',json.dumps(frames))
            hz = cap.get(cv2.CAP_PROP_FPS)
            #print(hz)
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