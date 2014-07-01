/**
 * @fileOverview The session storage core.
 */
var config = require('config');
var cip = require('cip');
var Promise = require('bluebird');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var log = require('logg').getLogger('app.core.SessionStore');

var globals = require('./globals');

/**
 * A Session store implementation using redis.
 *
 * @constructor
 */
var Session = module.exports = cip.extendSingleton(function() {
  /** @type {?RedisStore} Will contain an instance of RedisStore */
  this.sessionStore = null;

  /** @type {Object} Container for runtime configuration */
  this.params = {};

  // setup the config parameters
  switch (globals.role) {
  case globals.Roles.WEB:
    this.params.cookie = config.cookies.web;
    this.params.redis = config.redis.sessionWeb;
    break;
  case globals.Roles.API:
    this.params.cookie = config.cookies.api;
    this.params.redis = config.redis.sessionApi;
    break;
  }
});

/**
 * Perform a connection to redis.
 *
 * @return {Promise} A promise.
 */
Session.prototype.connect = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    // Sessions stored in redis
    self.sessionStore = new RedisStore(self.params.redis);

    function clearListeners() {
      self.sessionStore.removeListener('connect', onRedisSuccess);
      self.sessionStore.removeListener('disconnect', onRedisError);
    }
    function onRedisError(err) {
      log.warn('init() :: Session Redis store disconnected. Error:', err);
      reject(err);
      clearListeners();
    }
    function onRedisSuccess() {
      log.fine('init() :: Session Redis store connected.');
      resolve();
      clearListeners();
    }

    self.sessionStore.on('disconnect', onRedisError);
    self.sessionStore.on('connect', onRedisSuccess);
  });
};

/**
 * Initialize and return the session middleware.
 *
 * @return {Function} The session middleware configured.
 */
Session.prototype.use = function() {
  return session({
    secret: this.params.cookie.session.secret,
    store: this.sessionStore,
    name: this.params.cookie.name,
    resave: true,
    saveUninitialized: true,
    cookie: {
      // enable on SSL
      // secure: true,
      domain: this.params.cookie.domain,
      path: '/',
      httpOnly: false,
      maxAge: this.params.cookie.session.maxAge,
    }
  });
};
