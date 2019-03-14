import openSocket from 'socket.io-client';
const socketPOIFeed, socketVideoFeedState, socketVideoFeed = openSocket('http://localhost:5000');
function getPOIFeed(cb) {
  socketPOIFeed.on('feeds', feeds => cb(null, feeds));
}
function getVideoFeedState(cb){
  socketVideoFeedState.on('state', state => cb(null, state));
}
function getVideoFeed(cb){
  socketVideoFeedState.on('frame', state => cb(null, frame));
}
export { getPOIFeed, getVideoFeedState, getVideoFeed };