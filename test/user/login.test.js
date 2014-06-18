/**
 * @fileOverview Login tests.
 */

// var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');

var tester = require('../lib/tester.lib');
var Web = require('../lib/web.lib');
var userfix = require('../fixtures/user.fix');

var UserEnt = require('../../back/entities/user/user.ent');


describe('User Login', function() {
  this.timeout(10000);
  var req, userEnt, udo;

  tester.init('api');

  before(function() {
    userEnt = UserEnt.getInstance();
  });
  beforeEach(function(done) {
    var web = new Web('api');
    req = web.req;
    done();
  });

  beforeEach(function(done) {
    userEnt.delete({email: userfix.one.email})
      .then(done.bind(null, null), done);
  });

  beforeEach(function(done) {
    req.post('/register')
      .send({email: userfix.one.email, password:  userfix.one.password})
      .expect(302, done);
  });

  beforeEach(function(done) {
    userEnt.readOne({email: userfix.one.email})
      .then(function(resudo) {
        udo = resudo;
      }).then(done, done);
  });

  beforeEach(function(done) {
    req.get('/verify/' + udo.emailConfirmation.key + '/' + udo._id)
      .expect(302, done);
  });

  it('Will reject a login with wrong password', function(done) {
    req.post('/login')
      .send({email: userfix.one.email, password: 'wrong'})
      .expect(400, done);
  });
  it('Will reject a login with wrong email', function(done) {
    req.post('/login')
      .send({email: 'wrong again', password: 'wrong'})
      .expect(400, done);
  });
  it('Will reject a login with no arguments', function(done) {
    req.post('/login')
      .expect(400, done);
  });
  it('Can perform a login', function(done) {
    req.post('/login')
      .send({email: userfix.one.email, password:  userfix.one.password})
      .expect(302)
      .expect('location', '/dashboard', done);
  });
});
