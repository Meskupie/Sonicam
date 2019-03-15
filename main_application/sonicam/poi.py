import numpy as np
import math
import base64
import cv2
import logging
import time

from parameters import *
from measurement import Tracker

class POIManager():
    def __init__ (self):
        self.reset()

    def reset(self):
        self.poi_dict = {}
        self.background = POI(-1,None)

    def updateFromTracker(self,tracks,frame_raw):
        track_ids = []
        for track in tracks:
            # Record all ids being tracked
            poi_id = track.track_id
            logging.debug('Update POI with ID '+str(poi_id))
            track_ids.append(poi_id)
            assert str(poi_id) in self.poi_dict

            # Update beamforming angle
            state = track.location
            self.poi_dict[str(poi_id)].angle = POIManager.angleFromState(state)

            # Update feed data
            thumbnail = POIManager.headshotFromState(state,frame_raw)
            if len(thumbnail.shape) == 3:
                self.poi_dict[str(poi_id)].updateFeed(POIManager.encodeFrame(thumbnail))

        # Update POIs that are no longer being tracked. Delete if not in UI, update visible flag if in UI
        for key in list(self.poi_dict.keys()):
            if self.poi_dict[key].poi_id not in track_ids:
                if not self.poi_dict[key].is_shown:
                    del self.poi_dict[key]
                else:
                    self.poi_dict[key].is_visible = False
                    self.poi_dict[key].updateFeed(inplace=True)
        
    def updateFromDetection(self,tracks,frame_past):
        for track in tracks:
            poi_id = track.track_id
            state = track.location_meas
            if str(poi_id) in self.poi_dict:
                logging.debug('Old POI with ID '+str(poi_id))
                if self.poi_dict[str(poi_id)].thumbnailStale():
                    thumbnail = POIManager.encodeFrame(POIManager.headshotFromState(state,frame_past))
                    self.poi_dict[str(poi_id)].updateThumbnail(thumbnail)
            else:
                logging.debug('New POI with ID '+str(poi_id))
                thumbnail = POIManager.encodeFrame(POIManager.headshotFromState(state,frame_past))
                self.poi_dict[str(poi_id)] = POI(poi_id,thumbnail)

    def updateFromUIChange(self,response):
        response_ids = []
        for poi in response:
            #logging.info('==POST=='+str(poi))
            poi_id = poi['id']
            if poi_id == -1:
                self.background.mute = poi['mute']
                self.background.volume = poi['volume']
            else:
                response_ids.append(poi_id)
                self.poi_dict[str(poi_id)].mute = poi['mute']
                self.poi_dict[str(poi_id)].volume = poi['volume']

        # Update POIs that are no longer being tracked. Delete if not in UI, update shown flag
        for key in list(self.poi_dict.keys()):
            if self.poi_dict[key].poi_id not in response_ids:
                if not self.poi_dict[key].is_visible:
                    del self.poi_dict[key]
                else:
                    self.poi_dict[key].is_shown = False

    def updateFromPOIChange(self,poi_id,data):
        if poi_id == -1:
            self.background.mute = data['mute']
            self.background.volume = data['volume']
        else:
            self.poi_dict[str(poi_id)].mute = data['mute']
            self.poi_dict[str(poi_id)].volume = data['volume']

    def getFeeds(self):
        output_list = []
        for key,value in self.poi_dict.items():
            output_list.append(value.feed)
        return output_list

    def getPOIs(self,specific=None,verbose=False):
        if specific == None:
            output_list = []
            for key,value in self.poi_dict.items():
                if verbose:
                    output_list.append(value.getInfoVerbose())
                else:
                    output_list.append(value.getInfo())
                #logging.info('==GET==='+str(value.getInfo()))
                # Put a lock on deletion from missing track
                value.is_shown = True
            return output_list
        else:
            return self.poi_dict[str(specific)].getInfo()

    def getBeamformer(self):
        output_list = [self.background.getAudio()]
        for key,value in self.poi_dict.items():
            if value.getState() == 'lost':
                continue
            output_list.append(value.getAudio())
        return output_list

    def addPOI(self,poi_id,thumbnail):
        assert poi_id not in self.poi_dict
        self.poi_dict[str(poi_id)] = POI(poi_id,thumbnail)

    def encodeFrame(frame):
        ret, frame_encoded = cv2.imencode('.jpg',frame)
        frame_string = base64.b64encode(frame_encoded).decode('utf8')
        return frame_string

    def angleFromState(state):
        return -math.atan2(state[0],state[2])

    def headshotFromState(state,frame_raw):
        # Create an array of corners
        bb = Tracker.boundingBoxFromState(state,scale=param_headfeed_scale)
        c = np.zeros(4,dtype=int)
        c[0] = bb[0]
        c[1] = bb[1]
        c[2] = bb[0]+bb[2]
        c[3] = bb[1]+bb[3]
        
        # Caluclate indexs in the headfeed that the scaled video will occupy.
        # Fill remaining area with specified colour
        nx = np.zeros(2,dtype=int)
        nx[0] = int(round(param_headfeed_shape[0]*((max(c[0],0)-c[0])/(c[2]-c[0]))))
        nx[1] = int(param_headfeed_shape[0]-round(param_headfeed_shape[0]*((c[2]-min(c[2],1920))/(c[2]-c[0]))))
        ny = np.zeros(2,dtype=int)
        ny[0] = int(round(param_headfeed_shape[1]*((max(c[1],0)-c[1])/(c[3]-c[1]))))
        ny[1] = int(param_headfeed_shape[0]-round(param_headfeed_shape[1]*((c[3]-min(c[3],1080))/(c[3]-c[1]))))
        output_shape = (nx[1]-nx[0],ny[1]-ny[0])
        input_shape = frame_raw[int(max(c[1],0)):int(min(c[3],1080)),int(max(c[0],0)):int(min(c[2],1920)),:].shape
        
        # Just sanity checking that I am leaving in
        if output_shape[0] == 0 or output_shape[1] == 0:
            logging.warning('Skipping headfeed with output shape: '+str(output_shape))
            return np.zeros(0)
        if input_shape[0] == 0 or input_shape[1] == 0 or input_shape[2] == 0:
            logging.warning('Skipping headfeed with input shape: '+str(input_shape))
            return np.zeros(0)
        
        # Apply backgound color
        out = np.array([[param_headfeed_background]],dtype=np.uint8)
        out = np.repeat(out,param_headfeed_shape[0],axis=0)
        out = np.repeat(out,param_headfeed_shape[0],axis=1)
        # Add headfeed to array
        out[ny[0]:ny[1],nx[0]:nx[1],:] = cv2.resize(frame_raw[int(max(c[1],0)):int(min(c[3],1080)),int(max(c[0],0)):int(min(c[2],1920)),:],output_shape,interpolation = cv2.INTER_AREA)
        return out


class POI():
    def __init__(self,poi_id,thumbnail):
        self.poi_id = poi_id

        self.is_shown = False # in the UI
        self.is_visible = True # has a track

        self.mute = True
        self.volume = 0
        self.angle = 0

        self.importance = 0
        self.is_known = False
        self.feed = None

        self.thumbnail = {'id':self.poi_id,'frame':thumbnail}
        self.thumbnail_time = 0

        self.name = None
        self.height = None

    def getInfo(self):
        return {'id':self.poi_id,'state':self.getState(),'is_known':self.is_known,'importance':self.importance,'name':self.name,'height':self.height}

    def getInfoVerbose(self):
        return {'id':self.poi_id,'state':self.getState(),'is_known':self.is_known,'importance':self.importance,'name':self.name,'height':self.height,'frame':self.thumbnail['frame']}

    def getAudio(self):
        if self.mute:
            volume = 0
        else:
            volume = max(0,min(100,self.volume*100))
        return {'id':self.poi_id,'angle':self.angle*180.0/np.pi,'volume':volume}

    def getState(self):
        if not self.is_visible:
            return 'lost'
        else:
            return 'normal'

    def thumbnailStale(self):
        return (time.time()-self.thumbnail_time) > param_thumbnail_stale

    def updateThumbnail(self,thumbnail):
        self.thumbnail_time = time.time()
        self.thumbnail = {'id':self.poi_id,'frame':thumbnail}

    def updateFeed(self,headfeed=None,inplace=False):
        if inplace:
            del self.feed['state']
            self.feed['state'] = self.getState()
        else:
            self.feed = {'id':self.poi_id,'frame':headfeed,'state':self.getState()}
        
        
        
