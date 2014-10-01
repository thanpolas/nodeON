/**
 * @fileOverview Frontpage tests.
 */
var config = require('config');
// var sinon = require('sinon');
var req = require('supertest');
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');

var tester = require('../lib/tester.lib');
var Web = require('../lib/web.lib');

describe('Frontpage', function() {
  this.timeout(10000);

  tester.init();

  Web.setup();

  it('Will get a 200 on the website frontpage', function(done) {
    this.req.get('/')
      .expect(200, done);
  });
  it('Will not contain the "x-powered-by" header on website"', function(done) {
    this.req.get('/')
      .end(function(err, req) {
        expect(req.header).to.not.have.property('x-powered-by');
        done();
      });
  });
  it.only('Can access the site from 127.0.0.1', function(done) {
    var web = new Web('127.0.0.1:3000');
    this.req = web.req;
    this.req.get('/')
      .expect(200, done);
  });

  if (config.usevhosts) {
    it('Will get a 200 on the api frontpage', function(done) {
      this.reqApi.get('/')
        .expect(200, done);
    });
    it('Will not contain the "x-powered-by" header on api"', function(done) {
      this.reqApi.get('/')
        .end(function(err, req) {
          expect(req.header).to.not.have.property('x-powered-by');
          done();
        });
    });
  }
});
