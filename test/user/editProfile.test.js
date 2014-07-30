/**
 * @fileOverview Edit Profile tests.
 */

// var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');

var userfix = require('../fixtures/user.fix');
var setupFix = require('../lib/fixtures-user.lib');


describe('Profile Edit', function() {
  this.timeout(10000);

  setupFix.createUser();
  setupFix.login();

  it('should get a redirect to "/"', function(done) {
    this.req.post('/profile')
      .set('cookie', this.cookie)
      .send({firstName: 'new'})
      .expect(302)
      .expect('location', '/', done);
  });
  it('should perform the edit', function(done) {
    var self = this;
    this.req.post('/profile')
      .set('cookie', this.cookie)
      .send({firstName: 'new'})
      .expect(302)
      .expect('location', '/')
      .end(function(err) {
        if (err) { return done(err); }
        self.userEnt.readOne({email: userfix.one.email}).then(function(udo) {
          expect(udo.firstName).to.equal('new');
        }).then(done, done);
      });
  });
  it('should turn verified switch off when email changes ', function(done) {
    var self = this;
    this.req.post('/profile')
      .set('cookie', this.cookie)
      .send({email: 'new@demo.com'})
      .expect(302)
      .expect('location', '/')
      .end(function(err) {
        if (err) { return done(err); }
        self.userEnt.readOne({_id: self.udo._id}).then(function(udo) {
          expect(udo.email).to.equal('new@demo.com');
          expect(udo.isVerified).to.be.false;
          expect(udo.emailConfirmation.key).to.not.equal(self.udo.emailConfirmation.key);
        }).then(done, done);
      });
  });
});
