import cv2
import time

cap = cv2.VideoCapture('../data/sample_video_hard.mp4')
while True:
	ret,frame = cap.read()
	print(frame.shape)
	time.sleep(0.1)
