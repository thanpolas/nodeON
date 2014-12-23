/**
 * @fileOverview API websocket routes.
 *
 */
// var log = require('logg').getLogger('app.router.socket.api');
var SocketVersionApi = require('../controllers/socket/api-version.ctrl');
var socketPubsubCtrl = require('../controllers/socket/socket-pubsub.ctrl').getInstance();

var router = module.exports = {};

var socketVersionApi;

/**
 * Initialize the controllers.
 */
router.init = function() {
  socketVersionApi = SocketVersionApi.getInstance();
};

/**
 * Apply routes to an authorized socket.
 *
 * @param {socketio.Socket} socket The socket.io socket object.
 * @return {socketio.Socket} Return the socket.
 */
router.addRoutes = function(socket) {
  socket.on('version', socketVersionApi.get.bind(socketVersionApi, socket));
  socket.on('registerPubsub', socketPubsubCtrl.registerAll.bind(
    socketPubsubCtrl, socket));
  return socket;
};
