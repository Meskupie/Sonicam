import logging
import multiprocessing as mp
import math
import os
import numpy as np

from parameters import *

class BeamformerHard(mp.Process):
    def get_beamformer():
        mic_angles = np.zeros(param_num_channels)
        angle_delta = 360 / param_num_channels
        mic_angles[2] = 0 * angle_delta
        mic_angles[4] = 1 * angle_delta
        mic_angles[3] = 2 * angle_delta
        mic_angles[5] = 3 * angle_delta
        mic_angles[6] = 4 * angle_delta
        mic_angles[7] = 5 * angle_delta
        mic_angles[0] = 6 * angle_delta
        mic_angles[1] = 7 * angle_delta

        mic_rad = 0.07

        mic_pos = np.array([mic_rad * np.cos(np.deg2rad(mic_angles)), mic_rad * np.sin(np.deg2rad(mic_angles)), np.zeros(8)])

        micgeom = acoular.microphones.MicGeom(mpos_tot=mic_pos)

        grid = acoular.grids.RectGrid(z=0)

        tbf = acoular.tbeamform.BeamformerTime(grid=grid, mpos=micgeom)
        return tbf

    def get_delays_all(bf, samplerate):
        return bf.rm / bf.c * samplerate

    def angle2xy(angle):
        return (math.cos(angle * math.pi / 180), math.sin(angle * math.pi / 180))

    def get_grid_point(bf, angle):
        x, y = Beamformer.angle2xy(angle)
        xi, yi = bf.grid.index(x, y)
        return (xi, yi)

    def get_delays(bf, angle):
        xi, yi = Beamformer.get_grid_point(bf, angle)
        return Beamformer.get_delays_all(bf, param_fs)[xi * bf.grid.nysteps + yi,:]

    class BFQueue:
        def __init__(self, blocksize, bf, angle):
            self.samples = np.zeros((blocksize, param_num_channels))
            self.bf = bf
            self.angle = angle

        def add(self, block):
            self.samples = np.append(self.samples, block, axis=0)
            # print(self.samples.shape)

        def get(self, block, delays):
            d = np.zeros((param_blocksize,))
            for input_chidx in range(delays.shape[0]):
                delint = int(delays[input_chidx])
                #print(delint)
                #print(input_chidx)
                #print(self.samples[delint:delint+param_blocksize,input_chidx].shape)
                d+= self.samples[delint:delint+param_blocksize,input_chidx]
            self.samples = self.samples[param_blocksize:, :]
            return d

        def setAngle(self, angle):
            self.angle = angle

        def sd_callback(self, indata, outdata, frames, time, status):
            if status:
                print(status)

            self.add(indata)

            delays = Beamformer.get_delays(self.bf, self.angle)
            #print(delays)
            outd = self.get(frames, delays)
            #print(outd.shape)
            #print(outdata.shape)
            outdata[:,0] = outdata[:,1] = outd



    def __init__(self,name,queues):
        super(Beamformer,self).__init__()
        self.name = name+'Hard'

        # Grab references to linking data
        self.job_queue = queues['beamformer']
        
        # Start the Process
        self.start()

    def initProcess(self):
        sd._initialize()
        os.sched_setaffinity(0,{1,2})
        self.bf = Beamformer.get_beamformer()
        self.bfQueue = Beamformer.BFQueue(param_blocksize, self.bf, 0)
        self.input_dev = None
        for dev_idx, dev_dict in enumerate(sd.query_devices()):
            if "USBStreamer" in dev_dict['name']:
                self.input_dev = dev_idx
            if "default" in dev_dict['name']:
                self.output_dev = dev_idx
        #self.output_dev = 28
        if self.input_dev is None:
            logging.error("Could not find USBStreamer, not beamforming")
            return False
        return True

            
    def spinServiceJobs(self):
        logging.info("%d is input_dev and %d is output_dev", self.input_dev, self.output_dev)
        with sd.Stream(device=(self.input_dev, self.output_dev),
            samplerate=param_fs, latency='low', channels=(param_num_channels, param_output_ch),
            callback=self.bfQueue.sd_callback, blocksize=param_blocksize):
        # =============
        # Main loop
        # =============
            while True:
                job = self.job_queue.get()
                try:
                    if job['type'] == 'kill':
                        self.killSelf()
                        break
                    
                    elif job['type'] == 'angle':
                        self.bfQueue.setAngle(job['angle'])
                    
                    else:
                        logging.error('Unknown job type')
                        
                except KeyError as e:
                            logging.error('Could not service job with tag: '+str(e))
      
    
    def killSelf(self):
        pass
    
    def run(self):
        logging.info('Starting Process')
        if self.initProcess():
            try:
                self.spinServiceJobs()
            except Exception as e:
                logging.error('Killed due to ' + str(e))
                self.killSelf()
            finally:
                logging.info('Shutting Down Process')
        else:
            logging.warning('Audio hardware device not found')
        
    # External kill command
    def kill(self):
        self.job_queue.put({'type':'kill'})
        self.join()


class BeamformerSoft(mp.Process):
    def __init__(self,name,queues):
        super(Beamformer,self).__init__()
        self.name = name+'Soft'

        # Grab references to linking data
        self.job_queue = queues['beamformer']
        
        # Start the Process
        self.start()
            
    def spinServiceJobs(self):
        while True:
            job = self.job_queue.get()
            try:
                if job['type'] == 'kill':
                    self.killSelf()
                    break
                
                elif job['type'] == 'angle':
                    logging.info('Stearing to angle '+str(job['angle']))
                
                else:
                    logging.error('Unknown job type')
                    
            except KeyError as e:
                        logging.error('Could not service job with tag: '+str(e))
      
    
    def killSelf(self):
        pass
    
    def run(self):
        logging.info('Starting Process')
        try:
            self.spinServiceJobs()
        except Exception as e:
            logging.error('Killed due to ' + str(e))
            self.killSelf()
        finally:
            logging.info('Shutting Down Process')
        
    # External kill command
    def kill(self):
        self.job_queue.put({'type':'kill'})
        self.join()

try:
    import acoular
    import sounddevice as sd
except:
    Beamformer = BeamformerSoft
else:
    Beamformer = BeamformerHard
