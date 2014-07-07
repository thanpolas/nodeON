/**
 * @fileOverview API websocket routes.
 *
 */
// var log = require('logg').getLogger('app.router.socket.api');
var SocketVersionApi = require('../controllers/socket/api-version.ctrl');
var socketPubsubCtrl = require('../controllers/socket/socket-pubsub.ctrl');
var psutil = require('../services/pubsub-util.service');

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

  return socket;
};

/**
 * Register the incoming socket to pubsub channels
 *
 * @param {socketio.Socket} socket The socket.io socket object.
 * @return {socketio.Socket} Return the socket.
 */
router.registerPubsub = function (socket) {
  socketPubsubCtrl.register(psutil.Channel.DUMMY, socket);
};
