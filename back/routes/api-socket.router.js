/**
 * @fileOverview API websocket routes.
 *
 */
// var log = require('logg').getLogger('app.router.socket.api');

var router = module.exports = {};

var SocketVersionApi = require('../controllers/socket/api-version.ctrl');

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
 */
router.addRoutes = function(socket) {
  socket.on('version', socketVersionApi.get.bind(socketVersionApi, socket));
};
