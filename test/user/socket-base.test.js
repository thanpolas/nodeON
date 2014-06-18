/**
 * @fileOverview websockets surface tests
 */
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');
// var config = require('config');

var setupFix = require('../lib/fixtures-user.lib');
var tester = require('../lib/tester.lib');
var Sock = require('../lib/socket.lib');

describe('Websockets Manage Panel Tests', function() {
  this.timeout(7000);

  tester.init('api');

  describe('Surface Tests', function() {
    beforeEach(function() {
      this.sock = new Sock();
      this.sock.connect();
    });
    afterEach(function(done) {
      this.sock.close().then(done, done);
    });

    it('should connect', function(done){
      this.sock.socket.on('connect', function() {
        done();
      });
    });
    it('should receive a challenge', function(done) {
      this.sock.socket.on('challenge', function() {
        done();
      });
    });
    it('should disconnect if challenge is bogus', function(done) {
      this.sock.socket.on('challenge', function(data, cb) {
        cb('bah');
      });
      this.sock.socket.on('disconnect', function() {
        done();
      });
    });
  });


  describe('Challenge', function () {
    setupFix.createUser();
    setupFix.login();
    beforeEach(function() {
      this.sock = new Sock();
      this.sock.connect();
    });
    afterEach(function(done) {
      this.sock.close().then(done, done);
    });

    it('should pass the challenge using session id', function(done) {
      var self = this;
      this.sock.socket.on('challenge', function(data, cb) {
        cb(self.cookieObj.sessionId);
      });
      this.sock.socket.on('authorized', done);
    });
  });

  describe('Operation', function () {
    Sock.setupAuth();

    it('Should get the API version', function(done) {
      this.sock.socket.emit('version', null, function(resp) {
        expect(resp).to.equal('0.1');
        done();
      });
    });
  });
});
