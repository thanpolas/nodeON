/**
 * @fileOverview websocket subscriptions to system events.
 */

var cip = require('cip');
/*global -Map*/
var Map = require('collections/map');

var log = require('logg').getLogger('app.ctrl.socket.pubsub');

var pubsub = require('../../services/pubsub.service').getInstance();

var WsPubSub = module.exports = cip.extendSingleton(function() {
  /** @type {Map} Keys are registered channels, values a map with the sockIds */
  this.registry = new Map();
});

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
};

/**
 * Subscribe to a new channel.
 *
 * @param {app.service.pubsubUtil.Channel} channel The channel to subscribe to.
 */
WsPubSub.prototype.subToChannel = function (channel) {
  pubsub.sub(channel, this._onMessage.bind(this));
  this.registry.set(channel, new Map());
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
