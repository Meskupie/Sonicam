import cv2
from parameters import *


if __name__ == "__main__":
    WIDTH = 1920
    HEIGHT = 1080
    FPS = 30

    #pipeline = get_tegra_pipeline(WIDTH, HEIGHT, FPS)
    pipeline = get_stream_pipeline()
    cap = cv2.VideoCapture(pipeline)

    while(True):
        ret, frame = cap.read()

        # Display the resulting frame
        cv2.imshow('frame',frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # When everything done, release the capture
    cap.release()
    cv2.destroyAllWindows()
