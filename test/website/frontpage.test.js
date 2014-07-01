/**
 * @fileOverview Frontpage tests.
 */

// var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');

var tester = require('../lib/tester.lib');
var Web = require('../lib/web.lib');

describe('Frontpage', function() {
  this.timeout(10000);

  tester.init('web');

  Web.setup();

  it('Will get a 200 on the frontpage', function(done) {
    this.req.get('/')
      .expect(200, done);
  });
  it('Will not contain the "x-powered-by" header"', function(done) {
    this.req.get('/')
      .end(function(err, req) {
        expect(req.header).to.not.have.property('x-powered-by');
        done();
      });
  });
});
