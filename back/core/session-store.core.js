/**
 * @fileOverview The session storage core.
 */
var config = require('config');
var cip = require('cip');
var BPromise = require('bluebird');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var log = require('logg').getLogger('app.core.sessionStore');

var globals = require('./globals');

/** @type {Object.<app.core.Socket} Socket Server instances. */
var singletons = {};

/**
 * A Session store implementation using redis.
 *
 * @param {app.core.globals.Roles} role The role to assume, can be 'api', 'website'.
 * @constructor
 */
var Session = module.exports = cip.extend(function(role) {
  if (singletons[role]) {
    singletons[role].zit = 1;
    return singletons[role];
  }
  singletons[role] = this;

  /** @type {?RedisStore} Will contain an instance of RedisStore */
  this.redisStore = null;

  /** @type {Object} Container for runtime configuration */
  this.params = {};

  // setup the config parameters
  switch (role) {
  case globals.Roles.WEBSITE:
    this.params.cookie = config.cookies.website;
    this.params.redis = config.redis.sessionWebsite;
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
 * @return {BPromise} A promise.
 */
Session.prototype.connect = function() {
  var self = this;
  return new BPromise(function(resolve, reject) {
    // Sessions stored in redis
    self.redisStore = new RedisStore(self.params.redis);

    function clearListeners() {
      self.redisStore.removeListener('connect', onRedisSuccess);
      self.redisStore.removeListener('disconnect', onRedisError);
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

    self.redisStore.on('disconnect', onRedisError);
    self.redisStore.on('connect', onRedisSuccess);
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
    store: this.redisStore,
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
