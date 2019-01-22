import tensorflow as tf
import numpy as np
import cv2
import time
import matplotlib.pyplot as plt
import multiprocessing as mp

from detect_face import Detector

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
    
# Set Model
with tf.Graph().as_default():
    gpu_options = tf.GPUOptions(per_process_gpu_memory_fraction=0.75, allow_growth=True)
    sess = tf.Session(config=tf.ConfigProto(log_device_placement=False,gpu_options=gpu_options,))
    with sess.as_default():
        detector = Detector(sess,threshold=[0.6, 0.7, 0.7],img_shape=(1080,1920))
#time.sleep(0.5)

file = 'sample.jpg'
frame = cv2.imread(file)
scales = detector.getScales(frame, minsize=37, factor=0.6)

print(scales)
scales = [5,8,15,25] # [3,((5,3),(5,5))),8]
h, w = frame.shape[0:2]

frames = []
for scale in scales:
    frames.append(cv2.resize(frame,(int(w/scale),int(h/scale)), interpolation=cv2.INTER_AREA))

detector.reset()
for item in frames:
    detector.runFirstStage(item)

results = detector.runSecondStage(frame)

image = addDetectionToFrame(frame,results)
plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
plt.show()

print(len(results))