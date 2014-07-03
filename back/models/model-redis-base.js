/**
 * @fileOverview The base Model Class redis models extend from.
 */
var __ = require('lodash');
var Promise = require('bluebird');
var redis = require('redis');
var config = require('config');

var log = require('logg').getLogger('app.model.Redis');

var Model = require('./model-base');

var persistentClient = null;
var clients = [];
var noop = function(){};

/**
 * The base Model Class redis models extend from.
 *
 * @constructor
 * @extends {app.Model}
 */
var ModelRedis = module.exports = Model.extend(function() {
  /** @type {?redis.CreateClient} redis client */
  var client = null;
  /** @type {?redis.CreateClient} redis subscribe client */
  var sub = null;

  /*jshint camelcase:false */
  // initialize only when needed
  this.__defineGetter__('client', function(){
    if (client) {return client;}
    client = ModelRedis.getClient();
    return client;
  });
  // ignore set
  this.__defineSetter__('client', noop);
  // initialize the subscribe connection only when needed.
  this.__defineGetter__('sub', function(){
    if (sub) {return sub;}
    sub = ModelRedis.getClient(true);
    return sub;
  });
  // ignore set
  this.__defineSetter__('sub', noop);

  /** @type {string} The base namespace to use for storing to redis */
  this.NS = config.redis.namespace;
});


/**
 * Creates a persistent connection to redis and provides it.
 *
 * Optionally you can require a new connection from the arguments.
 *
 * @param {boolean=} optNew get a new client.
 * @return {redis.RedisClient} A redis client.
 * @static
 */
ModelRedis.getClient = function(optNew) {
  log.fine('getClient() :: Init. new: ' + !!optNew);

  if (!optNew && !__.isNull(persistentClient)) {
    return persistentClient;
  }

  var port = config.redis.main.port;
  var host = config.redis.main.host;
  var pass = config.redis.main.pass;
  var opts = config.redis.main.options;
  var client;

  log.finer('getClient() :: Creating client using host:', host, 'port:', port);
  try {
    client = redis.createClient(port, host, opts);
  } catch(ex) {
    log.error('getClient() :: Failed to create redis connection. Err: ', ex);
    return null;
  }

  if ( __.isString( pass ) ) {
    client.auth( pass );
  }

  if (!optNew) {
    persistentClient = client;
  }

  log.finer('getClient() :: Attaching error listener...');
  client.on('error', ModelRedis._onRedisError);

  clients.push(client);

  return client;
};

/**
 * Handle redis errors so exceptions will not bubble up.
 *
 * @param {string} err the error message
 * @static
 * @private
 */
ModelRedis._onRedisError = function(err) {
  log.fine('_onRedisError() :: ', err.message, err);
};



/**
 * Close all connections and reset objects.
 *
 * @static
 */
ModelRedis.dispose = function() {
  clients.forEach(function(client){
    client.end();
  });
  clients = [];
  persistentClient = null;
};


/**
 * Perform the first persistent connection and listen for ok / not
 *
 * @return {Promise} A promise.
 */
ModelRedis.connect = function() {
  return new Promise(function(resolve, reject) {

    log.fine('connect() :: Connect to Redis...');
    if (!__.isNull(persistentClient)) {
      resolve();
      return;
    }

    var client = ModelRedis.getClient();

    function onConnect() {
      client.removeListener('error', onError);
      resolve();
    }
    function onError(err) {
      client.removeListener('connect', onConnect);
      reject(err);
    }

    client.once('connect', onConnect);
    client.once('error', onError);
  });
};
