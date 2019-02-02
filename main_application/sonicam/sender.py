# from multiprocessing.connection import Client

# address = ('localhost', 6000)
# conn = Client(address, authkey='secret password')
# # can also send arbitrary objects:
# conn.send(['a', 2.5, None, int, sum])
# conn.send('close')
# conn.close()
import time

from multiprocessing.connection import Client
from array import array

address = ('localhost', 6000)
with Client(address, authkey=b'secret password') as conn:
    time.sleep(1)
    conn.send({'type':'fullframe'})
    time.sleep(1)
    conn.send_bytes(b'hello')
    conn.send_bytes(array('i', [42, 1729]))
    time.sleep(10)