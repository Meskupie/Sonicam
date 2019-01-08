import matplotlib.pyplot as plt
from matplotlib.collections import PatchCollection
from matplotlib.patches import Rectangle

class Graphics():
    def __init__(self,fig_,ax_):
        self.fig = fig_
        self.ax = ax_
        self.colors = ['r','b','g','k','m']
        
    def clear(self):
        self.ax.cla()
    
    def draw(self):
        self.ax.axis('equal')
        self.ax.axis([0,1920,0,1080])
        self.fig.canvas.draw()
        
    def add_measurement(self,meas):
        for m in meas:
            p = Rectangle((m['box'][0],m['box'][1]),m['box'][2],m['box'][3], \
                facecolor=self.colors[m['id']%len(self.colors)], alpha=0.5, edgecolor='None')
            self.ax.add_patch(p)
            