/**
 * @fileOverview Website websocket routes.
 *
 */
// var log = require('logg').getLogger('app.router.socket.web');

var router = module.exports = {};

var SocketVersion = require('../controllers/socket/version.ctrl');

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
 */
router.addRoutes = function(socket) {
  socket.on('version', socketVersion.get.bind(socketVersion, socket));
};
