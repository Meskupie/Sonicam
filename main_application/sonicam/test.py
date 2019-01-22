import time
import cv2
import numpy as np
import logging
from multiprocessing_logging import install_mp_handler
import ctypes
import matplotlib.pyplot as plt

import multiprocessing as mp

# Import internal libraries
#from parameters import *
from frameserver import FrameServer

# Setup logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(processName)s: [%(levelname)s] %(message)s',
                    #filename='log/sonicam.log',
                    #filemode='w'
                    )

install_mp_handler()

