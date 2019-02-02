import time
#import logging
#from multiprocessing.connection import Listener

from flask import Flask, render_template
from flask_socketio import SocketIO

from parameters import *

import eventlet
from eventlet.timeout import Timeout
eventlet.monkey_patch()#socket=False)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socket = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')
    
def applicationLink():
    
    listener = Listener(('localhost', 6000), authkey=b'secret password')
    application_pipe = listener.accept()
    while True:
        job = application_pipe.recv()
        
        if job['type'] == 'full_frame':
            frame_string = application_pipe.recv_bytes().decode('utf8')
            socket.emit('image',frame_string)


run_server = True
if __name__ == '__main__':
    threads = []
    threads.append(eventlet.spawn(applicationLink))
    try:
        print('Running Server')
        socket.run(app, host='127.0.0.1')
    except KeyboardInterrupt:
        for thread in threads:
            thread.exit()
        socket.stop()
    print('closing')
    
    
# import time

# import eventlet
# eventlet.monkey_patch()

# from flask import Flask, render_template
# from flask_socketio import SocketIO

# #import matplotlib.pyplot as plt

# app = Flask(__name__)
# app.config['SECRET_KEY'] = 'secret!'
# socket = SocketIO(app)#, logger=True, engineio_logger=True)

# kill_all = False


# @app.route('/')
# def index():
#     return render_template('index.html')
    
# def waitForInput():
#     input()
#     socket.stop()


# if __name__ == '__main__':
#     eventlet.spawn(waitForInput)
#     socket.run(app, host='127.0.0.1')