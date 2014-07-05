/**
 * @fileOverview Register form test.
 */

// var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');

var tester = require('../lib/tester.lib');
var Web = require('../lib/web.lib');
var userfix = require('../fixtures/user.fix');

var UserEnt = require('../../back/entities/user/user.ent');

describe('User Register endpoint', function() {
  this.timeout(8000);
  var userEnt;

  tester.init();

  before(function() {
    userEnt = UserEnt.getInstance();
  });

  Web.setup();

  beforeEach(function(done) {
    userEnt.delete({email: userfix.one.email})
      .then(done.bind(null, null), done);
  });

  afterEach(function(done) {
    done();
  });

  it('Registers a valid user with minimum required fields', function(done) {
    this.req.post('/register')
      .send({email: userfix.one.email, password:  userfix.one.password})
      .expect(302)
      .end(function(err) {
        if (err) return done(err);
        userEnt.readOne({email: userfix.one.email})
          .then(function(udo) {
            expect(udo).to.be.an('object');
          }).then(done, done);
      });
  });
  it('Does not Register an invalid email', function(done) {
    this.req.post('/register')
      .send({email: 'invalid', password: userfix.one.password})
      .expect(400, done);
  });
  it('It will not register a duplicate user', function(done) {
    var self = this;
    this.req.post('/register')
      .send({email: userfix.one.email, password:  userfix.one.password})
      .expect(302)
      .end(function(err) {
        if (err) return done(err);
        self.req.post('/register')
          .send({email: userfix.one.email, password:  userfix.one.password})
          .expect(400, done);
      });
  });
  describe('Will not pass malicious values to new user', function() {
    this.timeout(8000);
    var udo;
    var lowerEnd = Date.now() + (3600000 * 24 * 85);
    var higherEnd = Date.now() + (3600000 * 24 * 95);
    beforeEach(function(done) {
      this.req.post('/register')
        .send({
          _id: '507f191e810c19729de860ea',
          email: userfix.one.email,
          password: userfix.one.password,
          custom: 'one',
          name: 'ron',
          firstName: 'pon',
          lastName: 'zit',
          companyName: 'one',
          createdOn: Date.now() + 7776000000, // +3 months
          lastLogin: Date.now() + 7776000000, // +3 months
          lastIp: 'lol',
          emailConfirmation: {
            expires: Date.now(),
          },
          resetPassword: {
            expires: Date.now(),
          },
          isVerified: true,
          isAdmin: true,
        })
	.expect(302, done);
    });
    beforeEach(function(done) {
      userEnt.readOne({email: userfix.one.email})
        .then(function(resudo) {
          expect(resudo).to.be.an('object');
          udo = resudo;
        }).then(done, done);
    });

    it('will not modify id', function() {
      expect(udo._id).to.not.equal('507f191e810c19729de860ea');
    });

    it('will not add custom properties', function() {
      expect(udo).to.not.have.property('custom');
    });

    it('should not modify "name"', function(){
      expect(udo).to.not.have.property('name');
    });
    it('should modify "firstName"', function(){
      expect(udo.firstName).to.equal('pon');
    });
    it('should modify "lastName"', function(){
      expect(udo.lastName).to.equal('zit');
    });
    it('should modify "companyName"', function(){
      expect(udo.companyName).to.equal('one');
    });
    it('should not modify "createdOn"', function(){
      expect(udo.createdOn).to.be.lessThan(Date.now());
    });
    it('should not modify "lastLogin"', function(){
      expect(udo.lastLogin).to.be.lessThan(Date.now());
    });
    it('should not modify "lastIp"', function(){
      expect(udo.lastIp).to.not.equal('lol');
    });
    it('should not modify "emailConfirmation.expires"', function(){
      expect(udo.emailConfirmation.expires).to.be.within(lowerEnd, higherEnd);
    });
    it('should not modify "resetPassword.expires"', function(){
      expect(udo.resetPassword.expires).to.be.null;
    });
    it('should not modify "isVerified"', function(){
      expect(udo.isVerified).to.be.false;
    });
    it('should not modify "isAdmin"', function(){
      expect(udo.isAdmin).to.be.false;
    });
  });

});
