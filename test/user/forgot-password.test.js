/**
 * @fileOverview Forgot password tests.
 */

// var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');

var userfix = require('../fixtures/user.fix');
var setupFix = require('../lib/fixtures-user.lib');


describe('Forgot Password', function() {
  this.timeout(10000);

  setupFix.createUser();

  describe('Forgot View & Surface post', function() {
    it('Should get a 200 on the forgot view', function(done) {
      this.req.post('/forgot')
        .expect(200, done);
    });
    it('should perform the forgot submit', function(done) {

      this.req.post('/forgot')
        .send({email: userfix.one.email})
        .expect(200)
        .expect(/pleasant\@hq\.com/, done);
    });
    it('should create the forgot pass tokens', function(done) {
      var self = this;
      this.req.post('/forgot')
        .send({email: userfix.one.email})
        .expect(200)
        .end(function(err) {
          if (err) { return done(err); }
          self.userEnt.readOne({_id: self.udo._id}).then(function(udo) {
            expect(udo.resetPassword.key).to.be.a('string');
            expect(udo.resetPassword.key).to.have.length(32);
            var lowerEnd = Date.now() + (3600000 * 24 * 6);
            var higherEnd = Date.now() + (3600000 * 24 * 8);
            expect(udo.resetPassword.expires).to.be.within(lowerEnd, higherEnd);
          }).then(done, done);
        });
    });
  });

  describe('Password reset operations', function() {
    beforeEach(function(done) {
      var self = this;
      this.req.post('/forgot')
      .send({email: userfix.one.email})
      .expect(200)
      .end(function(err) {
        if (err) { return done(err); }
        self.userEnt.readOne({_id: self.udo._id}).then(function(udo) {
          self.resetPassword = udo.resetPassword;
        }).then(done, done);
      });
    });

    it('should get a 200 for the reset view', function(done) {
      this.req.get('/forgot/' + this.resetPassword.key + '/' + this.udo._id)
        .expect(200, done);
    });
    it('should get a 401 for the reset view with a wrong key', function(done) {
      this.req.get('/forgot/thewrongkey/' + this.udo._id)
        .expect(401, done);
    });
    it('should get a 302 to /login with successfull post', function(done) {
      this.req.post('/forgot/' + this.resetPassword.key + '/' + this.udo._id)
        .send({password: 'newpassword'})
        .expect(302)
        .expect('location', '/login', done);
    });
    it('should get a 401 with wrong key to post', function(done) {
      this.req.post('/forgot/wrong/' + this.udo._id)
        .send({password: 'newpassword'})
        .expect(401, done);
    });
    it('should actually change the password and reset forgot fields', function(done) {
      var self = this;
      this.req.post('/forgot/' + this.resetPassword.key + '/' + this.udo._id)
        .send({password: 'newpassword'})
        .expect(304)
        .expect('location', '/login')
        .end(function(err) {
          if (err) { return done(); }
          self.userEnt.readOne({_id: self.udo._id}).then(function(udo) {
            udo.verifyPassword('newpassword').then(done)
              .catch(function() {
                done('passwords do not match');
              });
          });
        });
    });
  });
});
