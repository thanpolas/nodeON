/**
 * @fileOverview Abstraction layer for PubSub ops.
 */
var EventEmitter = require('events').EventEmitter;

var log = require('logg').getLogger('app.service.PubSub');

var cip = require('cip');
var config = require('config');

var ModelRedisBase = require('nodeon-base').ModelRedisBase;

var CEventEmitter = cip.cast(EventEmitter);
// var __ = require('lodash');

/** @const {boolean} Hard set multiple instances configuration */
var MULTI = config.multipleNodes;

/**
 * Abstraction layer for PubSub ops.
 *
 * Currently implements redis PUBSUB functionality or stubs it if configured.
 *
 * @constructor
 * @extends {events.EventEmitter}
 */
var PubSub = module.exports = CEventEmitter.extendSingleton(function(){
  /** @type {?app.model.ModelRedis} */
  this.redis = null;

  /** @type {boolean} Has initialized once */
  this.hasInit = false;

});

/**
 * One time initializer
 *
 */
PubSub.prototype.init = function() {
  log.fine('_init() :: PubSub initializes. Multi Core environment' +
    ' (use Redis PubSub): ', MULTI, ' :: hasInit:', this.hasInit);

  if (this.hasInit) { return; }
  this.hasInit = true;

  this.redis = new ModelRedisBase();

  if (MULTI) {
    this.redis.sub.on('message', this._onSubMessage.bind(this));
  }
};


/**
 * Publish a message.
 *
 * @param {string} channel The channel to publish to.
 * @param {*} message The message to publish.
 */
PubSub.prototype.pub = function(channel, message) {
  log.fine('pub() :: Channel:', channel, ' :: Message:', message, ' :: MULTI :',
    MULTI);

  if (MULTI) {
    this.redis.client.publish(channel, JSON.stringify(message));
  } else {
    this.emit(channel, channel, message);
  }
};

/**
 * Subscribe to a channel.
 *
 * @param {string|Array.<string>} channel The channel or channels to subscribe.
 * @param {Function} listener The callback.
 * @param {Object=} optSelf Context for listener.
 */
PubSub.prototype.sub = function(channel, listener, optSelf) {
  log.fine('sub() :: Subscribing to channels:', channel);

  var channels;

  if (!Array.isArray(channel)) {
    channels = [channel];
  } else {
    channels = channel;
  }

  channels.forEach(function(chan){
    if (MULTI) {
      this.redis.sub.subscribe(chan);
    }
    this.on(chan, listener.bind(optSelf || null));
  }, this);
};

/**
 * Route and distribute incoming Redis messages.
 *
 * @param {string} channel The channel.
 * @param {string} message The message.
 * @private
 */
PubSub.prototype._onSubMessage = function(channel, message) {
  log.fine('_onSubMessage() :: Received Message, Channel:', channel, ':: Message:',
    message);

  if (MULTI) {
    message = JSON.parse(message);
  }
  this.emit(channel, channel, message);
};
