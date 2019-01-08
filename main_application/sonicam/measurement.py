import math

class MeasGenerator():
    def __init__(self,settings_):
        self.settings = settings_
        self.frame_shape = (1080,1920)
        
    def checkValidBox(self,box):
        if not (0 <= box[0] <= self.frame_shape[1]): return False
        if not (0 <= box[1] <= self.frame_shape[0]): return False
        if not (0 <= box[0]+box[2] <= self.frame_shape[1]): return False
        if not (0 <= box[1]+box[3] <= self.frame_shape[0]): return False
        return True
        
    def buildBox(self,center,box_radius):
        box = [int(round(center[0]-box_radius)),int(round(center[1]-box_radius)), int(round(box_radius*2)),int(round(box_radius*2))]
        return box
    
    def getData(self,time):
        results = []
        for person in self.settings:
            if person['start'] <= time <= person['end']:
                
                # {'id':<int>,'type':<str>,'position':(<x_centre>,<y_centre>,<radius>),'depth':(<x_bot_left>,<y_bot_left>,<x_top_right>,<y_top_right>),'speed':<px/s>,'start':<time_start_s>,'end':<time_end_s>}
                if person['type'] == 'circle':
                    # Calculate circle phasor
                    phasor = (math.cos(time*person['speed']/person['position'][2]),math.sin(time*person['speed']/person['position'][2]))
                    # Find box centre
                    center = (phasor[0]*person['position'][2]+person['position'][0],phasor[1]*person['position'][2]+person['position'][1])
                    # Calculate box_radius
                    if (person['depth'][0] == person['depth'][1]) and \
                        (person['depth'][2] == person['depth'][3]): # horizontal
                        left = person['depth'][0]
                        right = person['depth'][3]
                        box_radius = (((phasor[0]+1)/2)*(right-left)+left)/2
                    elif (person['depth'][0] == person['depth'][3]) and \
                        (person['depth'][1] == person['depth'][2]): # vertical
                        up = person['depth'][1]
                        down = person['depth'][0]
                        box_radius = (((phasor[1]+1)/2)*(up-down)+down)/2
                    else:
                        print("cant handle this input (depth)")
                    # Build box
                    box = self.buildBox(center,box_radius)
                    if not self.checkValidBox(box):
                        continue
                 
                # {'id':<int>,'type':<str>,'position':(<x_start>,<y_start>,<x_end>,<y_end>),'depth':(<at_start>,<at_end>),'speed':<px/s>,'start':<time_start_s>,'end':<time_end_s>}s
                if person['type'] == 'line':
                    dx = person['position'][2]-person['position'][0]
                    dy = person['position'][3]-person['position'][1]
                    dd = person['depth'][1]-person['depth'][0]
                    length = math.sqrt(dx*dx+dy*dy)
                    # determine where in the current movement cycle the object would be
                    mv_ratio = (person['speed']*time)/length
                    mv_percent = mv_ratio%1
                    # Calculate box center and depth
                    if math.floor(mv_ratio)%2 == 0: # going from start to end
                        #start+dm
                        center = (person['position'][0]+dx*mv_percent,person['position'][1]+dy*mv_percent)
                        box_radius = person['depth'][0]+dd*mv_percent
                    else: # going from end to start
                        #end-dm
                        center = (person['position'][2]-dx*mv_percent,person['position'][3]-dy*mv_percent)
                        box_radius = person['depth'][1]-dd*mv_percent
                    # Build box
                    box = self.buildBox(center,box_radius)
                    if not self.checkValidBox(box):
                        continue
                    
                # {'id':<int>,'type':<str>,'position':(<x>,<y>),'depth':(<depth>),'start':<time_start_s>,'end':<time_end_s>}
                if person['type'] == 'point':
                    center = (person['position'][0],person['position'][1])
                    box_radius = person['depth']
                    box = self.buildBox(center,box_radius)
                    if not self.checkValidBox(box):
                        continue
                
                result = {'id':person['id'],'box':box,'confidence':None,'keypoints':None}
                results.append(result)
        return results