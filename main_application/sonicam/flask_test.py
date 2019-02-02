import cv2
import time
import base64

import multiprocessing as mp

import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template
from flask_socketio import SocketIO

#import matplotlib.pyplot as plt

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socket = SocketIO(app)#, logger=True, engineio_logger=True)

kill_all = False


@app.route('/')
def index():
    return render_template('index.html', name='Michael')


def sending():
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
            socket.emit('image',frame_string)
            hz = cap.get(cv2.CAP_PROP_FPS)
            eventlet.sleep(max(0,(1/hz)-(time.time()-time_s)))
        #cap.close()
    print('closing')

def testing():
    while not kill_all:
        print('haha')
        time.sleep(1)

if __name__ == '__main__':
    eventlet.spawn(sending)
    
    P = mp.Process(target=testing)
    P.start()
    
    try:
        socket.run(app, host='127.0.0.1')
    except KeyboardInterrupt:
        print("here")
    finally:
        kill_all = True
        print("done")