/**
 * @fileOverview Websocket helper library for testing.
 */
var config = require('config');
var ioc = require('socket.io-client');
var Promise = require('bluebird');

var setupFix = require('./fixtures-user.lib');

/**
 * Provides connectivity and network helpers for websocket connections.
 *
 * @param {string=} optNamespace optionally define a namespace.
 * @constructor
 */
var Sock = module.exports = function(optNamespace) {
  var namespace = optNamespace || '';

  // expose the websocket server url
  this.sockurl = 'http://' + config.test.hostname + ':' + config.test.port +
    '/' + namespace;

  // expose required socket options
  this.sockopts = {
    transport: ['websocket'],
    multiplex: true,
    forceNew: true,
    reconnection: false,
  };
};

/**
 * Master helper for:
 *   - creating stub users
 *   - Logging them in
 *   - Establishing a websocket connection
 *   - Authenticatong the websocket connection
 *
 * @static
 */
Sock.setupAuth = function() {
  setupFix.createUser();
  setupFix.login();
  beforeEach(function (done) {
    this.sock = new Sock('website');
    this.sock.connect();
    this.sock.socket.on('connect', done);
  });
  beforeEach(function (done) {
    var self = this;
    this.sock.socket.on('challenge', function(data, cb) {
      cb(self.cookieObj.sessionId);
    });
    this.sock.socket.on('authorized', done);
  });

  afterEach(function(done) {
    this.sock.close().then(done, done);
  });
};

/**
 * Perform a connection
 *
 */
Sock.prototype.connect = function() {
  // perform connection...
  this.socket = ioc(this.sockurl, this.sockopts);
};

/**
 * Close the connection.
 *
 * @return {Promise} A promise.
 */
Sock.prototype.close = function() {
  var self = this;
  return new Promise(function(resolve) {
    if (!self.socket.connected) {
      resolve();
      return;
    }
    self.socket.on('disconnect', function() {
      resolve();
    });
    self.socket.disconnect();
  });
};
