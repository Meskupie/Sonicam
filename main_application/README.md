# Sonicam

### FileServer.py
Spawns a process that services frame manipulation. It gathers frames from the camera storing them into a local buffer. When requested, it grabs the appropriate frame and services the desired frame manipulation returning the result.