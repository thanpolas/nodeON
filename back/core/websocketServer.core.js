/**
 * @fileOverview Websockets API implementation.
 */
var EventEmitter = require('events').EventEmitter;

var cip = require('cip');
var socketio = require('socket.io');
var config = require('config');
var log = require('logg').getLogger('app.core.socket');

var SockAuth = require('../middleware/websocket/websocket-auth.midd');
var socketRouter = require('../routes/socket.router');

var CeventEmitter = cip.cast(EventEmitter);

/**
 *
 * This module is an instance of EventEmitter.
 *
 * @constructor
 * @extends {events.EventEmitter}
 */
var Sock = module.exports = CeventEmitter.extend(function() {
  /** @type {?socketio.Server} The socket.io server */
  this.io = null;
});

/**
 * Initialize and configure the websockets server.
 *
 * @param {http} http The http instance.
 */
Sock.prototype.init = function(http) {
  log.info('init() :: Initializing websocket server...');

  // initialize router
  socketRouter.init();

  var io = this.io = socketio(http, {
    // allow all transports
    // 'transports': ['websocket'],

    // The timeout for the client, when it closes the connection it waits X
    // amounts of seconds to reopen the connection. This value is sent
    // to the client after a successful handshake.
    'close timeout': config.websocket.closeTimeout,

    // Does Socket.IO need to serve the static resources like socket.io.js and
    // WebSocketMain.swf etc.
    'browser client': true,
  });

  io.on('connection', function(socket) {
    log.finer('onConnection() :: New websocket connection:', socket.id);
    SockAuth.challenge(socket)
      .then(socketRouter.addRoutes.bind(null, socket))
      .catch(function(err) {
        log.warn('onConnection() :: Challenge failed:', err.message);
        socket.disconnect();
      });

    socket.on('disconnect', function() {
      log.finer('onDisconnect() :: Websocket disconnected:', socket.id);
    });
  });
};
