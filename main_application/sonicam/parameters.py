import os
param_jetson = 'tegra' in os.uname()[1]

# List of parameters for use in Sonicam

# Common
param_cam_fps = 30
if param_jetson:
    param_use_cam = True
    param_flip_video = False
    param_use_gpu = 1
else:
    param_use_cam = False
    param_flip_video = False
    param_use_gpu = 0

# FrameServer
param_frame_shape = (1080,1920,3) # camera data shape
param_image_buffer_length = 30 # length of frame buffer
param_n_image_workers = 3
param_image_buffer_end = 2
param_frame_period = 1.0/param_cam_fps

param_src_file = '../data/sample_video_hard.mp4'
param_src_cam = "nvcamerasrc ! video/x-raw(memory:NVMM), width=(int)" + str(param_frame_shape[1]) + ", height=(int)" + \
        str(param_frame_shape[0]) + ", format=(string)I420, framerate=(fraction)" + str(param_cam_fps) + \
        "/1 ! nvvidconv ! video/x-raw, format=(string)BGRx ! videoconvert ! video/x-raw, format=(string)BGR ! appsink"
param_src = param_src_cam if param_use_cam else param_src_file

# FaceDetector
param_detector_thresholds = [0.7, 0.8, 0.8]
param_pyramid_scalings     = [3 ,5 ,8 ,15,25]
param_pyramid_scaling_srcs = [-1,-1,-1, 1, 1]
param_pyramid_shapes = [(int(round(param_frame_shape[0]/scale)),int(round(param_frame_shape[1]/scale)),param_frame_shape[2]) for scale in param_pyramid_scalings]
import tensorflow as tf
if param_use_gpu:
    gpu_options = tf.GPUOptions(per_process_gpu_memory_fraction=0.75, allow_growth=True)
    param_tf_mtcnn_config = tf.ConfigProto(log_device_placement=False,gpu_options=gpu_options)
else:
    param_tf_mtcnn_config = tf.ConfigProto(log_device_placement=False)
    
# Beamformer
param_fs = 44100
param_blocksize = param_fs // 100
param_c = 343 # m/s
param_num_channels = 8
param_output_ch = 2

# Webserver
param_flask_queue_spin_rate = 200

# Shared
shared_vars = {}
