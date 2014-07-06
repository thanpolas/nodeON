/**
 * @fileOverview Websockets API implementation.
 */
var EventEmitter = require('events').EventEmitter;

var cip = require('cip');
var socketio = require('socket.io');
var config = require('config');
var log = require('logg').getLogger('app.core.Socket');

var SockAuth = require('../middleware/websocket/websocket-auth.midd');
var webRouter = require('../routes/web-socket.router');
var apiRouter = require('../routes/api-socket.router');
var globals = require('./globals');

var CeventEmitter = cip.cast(EventEmitter);

/**
 *
 * This module is an instance of EventEmitter.
 *
 * @constructor
 * @extends {events.EventEmitter}
 */
var Sock = module.exports = CeventEmitter.extendSingleton(function() {
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

  // initialize routers
  webRouter.init();
  apiRouter.init();

  this.io = socketio(http, {
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
};

/**
 * Bind connection listeners on websocket server.
 *
 * @param {app.core.globals.WebsocketNamespace=} optNamespace Define a namespace
 *    @see http://socket.io/docs/rooms-and-namespaces/
 */
Sock.prototype.listen = function(optNamespace) {
  var ns = optNamespace || '/';
  var io;
  var socketRouter;

  switch(ns) {
  case globals.WebsocketNamespace.WEBSITE:
    io = this.io.of(ns);
    socketRouter = webRouter;
    break;
  case globals.WebsocketNamespace.API:
    io = this.io.of(ns);
    socketRouter = apiRouter;
    break;
  default:
    io = this.io;
    socketRouter = webRouter;
  }

  log.fine('listen() :: Websocket listening for connections on Namespace:', ns);

  io.on('connection', function(socket) {
    log.finer('onConnection() :: New websocket connection. NS:', ns,
      'socketId:', socket.id);
    var sockAuth = new SockAuth(socket, ns);
    sockAuth.challenge(socket)
      .then(socketRouter.addRoutes.bind(null, socket))
      .catch(function(err) {
        log.warn('onConnection() :: Challenge failed. NS:', ns, 'Error:',
          err.message);
        socket.disconnect();
      });

    socket.on('disconnect', function() {
      log.finer('onDisconnect() :: Websocket disconnected. NS:', ns,
        'socketId:', socket.id);
    });
  });
};
