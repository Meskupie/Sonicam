import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:5000');
function getVideoFeed(cb) {
  socket.on('feeds', feeds => cb(null, feeds));
}
export { getVideoFeed };