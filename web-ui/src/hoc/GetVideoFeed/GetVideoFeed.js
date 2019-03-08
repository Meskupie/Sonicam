import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:5000');
function getVideoFeed(cb) {
  socket.on('thumbnails', image => cb(null, image));
}
export { getVideoFeed };