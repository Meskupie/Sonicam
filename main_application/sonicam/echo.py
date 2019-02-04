import sounddevice as sd
# import multiprocessing as mp
import os
from multiprocessing import Process

duration = 30  # seconds

fs = 44100
blocksize = fs // 100
c = 343

input_ch = 8

output_ch = 2

def callback(indata, outdata, frames, time, status):
    if status:
        print(status)
    #print(indata.shape)
    #print(outdata.shape)
    outdata[:] = indata[:,:2]

def start_echo():
    os.sched_setaffinity(0,{0})
    sd._initialize()
    for dev_idx, dev_dict in enumerate(sd.query_devices()):
        if "USBStreamer" in dev_dict['name']:
            input_dev = dev_idx
            break
    print("input device: ", input_dev)
    output_dev = 28 # bt on jetson tx2
    print("output device: ", output_dev)
    with sd.Stream(device=(input_dev, output_dev), channels=(input_ch, output_ch), callback=callback):
        sd.sleep(int(duration * 1000))

p = Process(target=start_echo)
p.start()
p.join()
