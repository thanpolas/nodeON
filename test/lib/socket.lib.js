/**
 * @fileOverview Websocket helper library for testing.
 */
var config = require('config');
var ioc = require('socket.io-client');
var Promise = require('bluebird');

var tester = require('./tester.lib');
var setupFix = require('./fixtures-user.lib');

/**
 * Provides connectivity and network helpers for websocket connections.
 *
 * @constructor
 */
var Sock = module.exports = function() {
  // expose the websocket server url
  this.sockurl = 'ws://' + config.test.hostname + ':' + config.test.port;

  // expose required socket options
  this.sockopts = {
    transport: ['websocket'],
    multiplex: false,
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
    this.sock = new Sock();
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

  tester.teardown(function(done) {
    this.sock.close().then(done, done);
  });

};


/**
 * Perform a connection
 *
 */
Sock.prototype.connect = function() {
  // perform connection...
  this.socket = ioc.connect(this.sockurl, this.sockopts);
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
