/**
 * @fileOverview websocket subscriptions to system events.
 */

var cip = require('cip');
/*global -Map*/
var Map = require('collections/map');

var log = require('logg').getLogger('app.ctrl.socket.pubsub');

var pubsub = require('../../services/pubsub.service').getInstance();
var psutil = require('../../services/pubsub-util.service');

var WsPubSub = module.exports = cip.extendSingleton(function() {
  /** @type {Map} Keys are registered channels, values a map with the sockIds */
  this.registry = new Map();
});

/**
 * Register the incoming socket to pubsub channels
 *
 * @param {socketio.Socket} socket The socket.io socket object.
 * @param {socketio.Socket} socket The socket.io socket instance.
 * @param {*} data Data sent from the client.
 * @param {Function} resp Callback with response to client.
 */
WsPubSub.prototype.registerAll = function (socket, data, resp) {
  this.register(psutil.Channel.DUMMY, socket);

  resp('ok');
};

/**
 * Register a websocket to a pubsub channel.
 *
 * @param {app.service.pubsubUtil.Channel} channel The channel to subscribe to.
 * @param {socket-io.Socket} socket A websocket instance.
 */
WsPubSub.prototype.register = function(channel, socket) {
  if (!this.registry.has(channel)) {
    this.subToChannel(channel);
  }

  var socketPool = this.registry.get(channel);
  socketPool.set(socket.id, socket);
  this.registry.set(channel, socketPool);

  socket.on('disconnect', this._removeSocket.bind(this, channel, socket));
};

/**
 * Remove a websocket from the channel's socketPool.
 *
 * @param {app.service.pubsubUtil.Channel} channel The channel to subscribe to.
 * @param {socket-io.Socket} socket A websocket instance.
 * @private
 */
WsPubSub.prototype._removeSocket = function(channel, socket) {
  var socketPool = this.registry.get(channel);
  socketPool.delete(socket.id);
  this.registry.set(channel, socketPool);
};

/**
 * Subscribe to a new channel.
 *
 * @param {app.service.pubsubUtil.Channel} channel The channel to subscribe to.
 */
WsPubSub.prototype.subToChannel = function (channel) {
  pubsub.sub(channel, this._onMessage.bind(this));
  var socketPool = new Map();
  this.registry.set(channel, socketPool);
};

/**
 * A message was received from the pubsub channel.
 *
 * @param {app.service.pubsubUtil.Channel} channel The channel to subscribe to.
 * @param {*} message Anything
 * @private
 */
WsPubSub.prototype._onMessage = function (channel, message) {
  log.fine('_onMessage() :: Channel:', channel, 'message:', message);

  if (!this.registry.has(channel)) {
    return; // bail early
  }

  var socketPool = this.registry.get(channel);

  socketPool.forEach(function (socket) {
    socket.emit(channel, message);
  }, this);
};
