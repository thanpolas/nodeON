/**
 * @fileOverview Verification tests.
 */

// var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');

var tester = require('../lib/tester.lib');
var Web = require('../lib/web.lib');
var userfix = require('../fixtures/user.fix');

var UserEnt = require('../../back/entities/user/user.ent');

describe('User Verification', function() {
  this.timeout(8000);
  var userEnt, udo;

  tester.init('api');

  before(function() {
    userEnt = UserEnt.getInstance();
  });
  Web.setup();

  beforeEach(function(done) {
    userEnt.delete({email: userfix.one.email})
      .then(done.bind(null, null), done);
  });

  beforeEach(function(done) {
    this.req.post('/register')
      .send({email: userfix.one.email, password:  userfix.one.password})
      .expect(302, done);
  });

  beforeEach(function(done) {
    userEnt.readOne({email: userfix.one.email})
      .then(function(resudo) {
        udo = resudo;
      }).then(done, done);
  });

  afterEach(function(done) {
    done();
  });

  it('Has a verification Token', function() {
    expect(udo.emailConfirmation.key).to.be.a('string');
  });
  it('Has a proper expiration Date', function() {
    var lowerEnd = Date.now() + (3600000 * 24 * 85);
    var higherEnd = Date.now() + (3600000 * 24 * 95);
    expect(udo.emailConfirmation.expires).to.be.within(lowerEnd, higherEnd);
  });
  it('does not have the verified flag on', function() {
    expect(udo.isVerified).to.be.false;
  });
  it('Will accept our verification and redirect us to index', function(done) {
    this.req.get('/verify/' + udo.emailConfirmation.key + '/' + udo._id)
      .expect(302)
      .expect('location', '/', done);
  });
  it('Will turn the "isVerified" switch to true after verification', function(done) {
    this.req.get('/verify/' + udo.emailConfirmation.key + '/' + udo._id)
      .end(function() {
        userEnt.readOne({email: userfix.one.email})
          .then(function(resudo) {
            expect(resudo.isVerified).to.be.true;
          }).then(done, done);
      });
  });
});
