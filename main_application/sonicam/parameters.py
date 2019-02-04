import os
param_jetson = 'tegra' in os.uname()[1]

# List of parameters for use in Sonicam

# Common
def get_tegra_pipeline(width, height, fps):
    return "nvcamerasrc ! video/x-raw(memory:NVMM), width=(int)" + str(width) + ", height=(int)" + \
        str(height) + ", format=(string)I420, framerate=(fraction)" + str(fps) + \
        "/1 ! nvvidconv ! video/x-raw, format=(string)BGRx ! videoconvert ! video/x-raw, format=(string)BGR ! appsink"

def get_stream_pipeline():
    return "udpsrc port=5000 ! application/x-rtp,encoding-name=H264,payload=96 ! rtph264depay ! h264parse ! omxh264dec ! videoconvert ! video/x-raw, format=(string)BGR ! appsink"

if param_jetson:
    param_use_cam = False
    param_flip_video = False
    param_use_gpu = 1
else:
    param_use_cam = False
    param_flip_video = True
    param_use_gpu = 0

param_src_file = '../data/sample_video.mp4'
#param_src_cam = get_tegra_pipeline(1920, 1080, 30)
param_src_cam = get_stream_pipeline()

param_src = param_src_cam if param_use_cam else param_src_file

# FrameServer
param_frame_shape = (1080,1920,3) # camera data shape
param_image_buffer_length = 30 # length of frame buffer
param_n_image_workers = 3
param_image_buffer_end = 2
param_frame_period = 0.0333

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
