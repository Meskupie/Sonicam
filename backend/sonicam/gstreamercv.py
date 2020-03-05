import cv2

def get_tegra_pipeline(width, height, fps):
    return "nvcamerasrc ! video/x-raw(memory:NVMM), width=(int)" + str(width) + ", height=(int)" + \
           str(height) + ", format=(string)I420, framerate=(fraction)" + str(fps) + \
           "/1 ! nvvidconv ! video/x-raw, format=(string)BGRx ! videoconvert ! video/x-raw, format=(string)BGR ! appsink"

if __name__ == "__main__":
    WIDTH = 1920
    HEIGHT = 1080
    FPS = 30

    pipeline = get_tegra_pipeline(WIDTH, HEIGHT, FPS)
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
