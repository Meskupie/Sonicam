import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:5000');
function getPOIFeed(cb) {
  socket.on('feeds', feeds => cb(null, feeds));
}
const socket2 = openSocket('http://localhost:5000');
function getVideoFeedState(cb){
  socket2.on('state', state => cb(null, state));
}
export { getPOIFeed, getVideoFeedState };