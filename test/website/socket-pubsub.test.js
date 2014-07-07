/**
 * @fileOverview websockets pubsub tests
 */
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');
// var config = require('config');

var tester = require('../lib/tester.lib');
var Sock = require('../lib/socket.lib');

var pubsub = require('../../back/services/pubsub.service').getInstance();

describe('Websockets pubsub tests', function() {
  this.timeout(7000);

  tester.init();

  describe('Surface Tests', function() {
    Sock.setupAuth();

    it('Should receive the published message', function(done) {
      var obj = {
        a: 1,
        b: '2',
        c: null,
        d: {e: 9},
        f: [1,2,3,4],
      };
      this.sock.socket.on('dummy', function (data) {
        expect(data).to.deep.equal(obj);
        done();
      });

      // manually pub on the dummy chann
      pubsub.pub('dummy', obj);
    });
  });
});
