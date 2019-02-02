# from multiprocessing.connection import Listener

# address = ('localhost', 6000)     # family is deduced to be 'AF_INET'
# listener = Listener(address, authkey='secret password')
# conn = listener.accept()
# print('connection accepted from', listener.last_accepted)
# while True:
#     msg = conn.recv()
#     # do something with msg
#     if msg == 'close':
#         conn.close()
#         break
# listener.close()
import time
from multiprocessing.connection import Listener
from array import array

import eventlet
eventlet.monkey_patch(socket=False,select=False)

listener = Listener(('localhost', 6000), authkey=b'secret password')
conn = listener.accept()

print('connection accepted from', listener.last_accepted)
while True:
    print(conn.poll())
    time.sleep(0.5)
print(conn.recv())                  # => [2.25, None, 'junk', float]
print(conn.recv_bytes())            # => 'hello'
arr = array('i', [0, 0, 0, 0, 0])
print(conn.recv_bytes_into(arr))    # => 8
print(arr)                          # => array('i', [42, 1729, 0, 0, 0])

conn.close()
listener.close()