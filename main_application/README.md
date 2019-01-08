# Sonicam Application
Python application to run the main application.

Camera data is processed to locate and track humans in a video feed. The coresponding tracked faces are streamed to a front end UI for interface. Selected humans suply their location to the audio processing stack which focuses microphone recording in their direction.

### FileServer.py
Spawns a process that services frame manipulation. It gathers frames from the camera storing them into a local buffer. When requested, it grabs the appropriate frame and services the desired frame manipulation returning the result.