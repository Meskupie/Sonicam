# List of parameters for use in Sonicam
import tensorflow as tf


# Common
param_use_gpu = 0

# Shared
shared_vars = {}

# FrameServer
param_frame_shape = (1080,1920,3) # camera data shape

param_image_buffer_length = 20 # length of frame buffer

param_n_image_workers = 3

param_image_buffer_end = 2
param_frame_period = 0.0333

# FaceDetector
param_detector_thresholds = [0.6, 0.7, 0.7]

param_pyramid_scalings     = [3 ,5 ,8 ,15,25]
param_pyramid_scaling_srcs = [-1,-1,-1, 1, 1]

param_pyramid_shapes = [(int(round(param_frame_shape[0]/scale)),int(round(param_frame_shape[1]/scale)),param_frame_shape[2]) for scale in param_pyramid_scalings]

if param_use_gpu:
    gpu_options = tf.GPUOptions(per_process_gpu_memory_fraction=0.75, allow_growth=True)
    param_tf_mtcnn_config = tf.ConfigProto(log_device_placement=False,gpu_options=gpu_options)
else:
    param_tf_mtcnn_config = tf.ConfigProto(log_device_placement=False)