import matplotlib.pyplot as plt
from matplotlib.collections import PatchCollection
from matplotlib.patches import Rectangle

class Graphics():
    def __init__(self,fig_,ax_):
        self.fig = fig_
        self.ax = ax_
        self.colors = ['r','b','g','k','m']
        self.shape = (1080,1920)
        
    def clear(self):
        self.ax.cla()
    
    def draw(self):
        self.ax.axis('equal')
        self.ax.axis([0,self.shape[1],0,self.shape[0]])
        self.fig.canvas.draw()
        
    def addMeasurement(self,meas):
        for m in meas:
            p = Rectangle((m['box'][0],m['box'][1]),m['box'][2],m['box'][3], \
                facecolor=self.colors[m['id']%len(self.colors)], alpha=0.5, edgecolor='None')
            self.ax.add_patch(p)
    
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
            