/**
 * @fileOverview Website websocket routes.
 *
 */
// var log = require('logg').getLogger('app.router.socket.web');

var router = module.exports = {};

var SocketVersion = require('../controllers/socket/version.ctrl');
var socketPubsubCtrl = require('../controllers/socket/socket-pubsub.ctrl');
var psutil = require('../services/pubsub-util.service');

var socketVersion;

/**
 * Initialize the controllers.
 */
router.init = function() {
  socketVersion = SocketVersion.getInstance();
};

/**
 * Apply routes to an authorized socket.
 *
 * @param {socketio.Socket} socket The socket.io socket object.
 * @return {socketio.Socket} Return the socket.
 */
router.addRoutes = function(socket) {
  socket.on('version', socketVersion.get.bind(socketVersion, socket));

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
