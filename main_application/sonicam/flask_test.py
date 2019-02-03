import cv2
import time
import base64
#import ctypes


# =============
# Setup logging
# =============
import logging
from multiprocessing_logging import install_mp_handler

logging.basicConfig(level=logging.WARNING,
                    format='%(asctime)s %(processName)s: [%(levelname)s] %(message)s',
                    #filename='log/sonicam.log',
                    #filemode='w'
                    )
install_mp_handler()



#import multiprocessing as mp

import eventlet as e

from flask import Flask, render_template
from flask_socketio import SocketIO

#import matplotlib.pyplot as plt

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socket = SocketIO(app)#, logger=True, engineio_logger=True)

def killSystem(flag,threads):
    if flag.value == 1:
        logging.warning('System terminating')
        flag.value = 0
        for thread in threads:
            thread.kill()

@app.route('/')
def index():
    return render_template('index.html')


def sending(flag):
    while flag.value == 1:
        cap = cv2.VideoCapture('../data/sample_video.mp4')
        while flag.value == 1 and cap.isOpened():
            time_s = time.time()
            ret,frame = cap.read()
            if not ret: break
            frame = cv2.resize(frame,(960,540))
            frame = cv2.flip(frame, -1)
            ret, frame_encoded = cv2.imencode('.jpg',frame)
            frame_string = base64.b64encode(frame_encoded).decode('utf8')
            socket.emit('image',frame_string)
            hz = cap.get(cv2.CAP_PROP_FPS)
            e.sleep(max(0,(1/hz)-(time.time()-time_s)))
        #cap.close()
    print('closing')

        
def waitForInput(running_flag,threads):
    logging.warning('Started')
    input()
    socket.stop()
    
def dummyProcess(flag):
    try:
        while flag.value == 1:
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass

class Temp:
    def __init__(self):
        self.value = 0

if __name__ == '__main__':
    #running_flag = mp.Value(ctypes.c_ubyte)
    running_flag = Temp()
    running_flag.value = 1
    
    threads = []
    threads.append(e.spawn(sending,running_flag))
    threads.append(e.spawn(waitForInput,running_flag,threads))
    
    # mp.Process(target=dummyProcess,args=(running_flag,)).start()
    #     #P.start()
    
    try:
        socket.run(app, host='127.0.0.1')
    finally:
        killSystem(running_flag,threads)