/**
 * @fileOverview Setup User Fixtures
 */
var Promise = require('bluebird');

var tester = require('./tester.lib');
var UserEnt = require('../../back/entities/user/user.ent');
var Web = require('./web.lib');
var userfix = require('../fixtures/user.fix');

var fixtures = module.exports = {};

/**
 * Provide some fixtures.
 *
 * Will populate on the test context the following properties:
 *   - req (supertest)
 *   - udo
 *   - userEnt
 */
fixtures.createUser = function() {
  tester.init('api');

  beforeEach(function() {
    this.userEnt = UserEnt.getInstance();
  });

  Web.setup();

  beforeEach(function(done) {
    Promise.all([
      this.userEnt.delete({email: userfix.one.email}),
      this.userEnt.delete({email: 'new@demo.com'}),
      this.userEnt.delete({email: userfix.three.email}),
    ]).then(done.bind(null, null), done);
  });

  beforeEach(function(done) {
    var self = this;
    this.userEnt.create(userfix.oneFull)
      .then(function(userDataObject) {
        self.udo = userDataObject;
      }).then(done, done);
  });
  beforeEach(function(done) {
    var self = this;
    this.userEnt.create(userfix.three)
      .then(function(userDataObject) {
        self.udoThree = userDataObject;
      }).then(done, done);
  });

};

/**
 * Performs a web login, populates:
 *   - cookie The cookie value to use.
 *
 */
fixtures.login = function() {
  beforeEach(function(done) {
    var self = this;
    this.req.post('/login')
      .send({email: this.udo.email, password:  userfix.oneFull.password})
      .end(function(err, res) {
        if (err) { return done(err); }
        self.cookie = res.headers['set-cookie'][0];
        self.cookieObj = fixtures._splitCookie(self.cookie);
        done();
      });
  });
  beforeEach(function(done) {
    var self = this;
    this.req.post('/login')
      .send({email: userfix.three.email, password:  userfix.three.password})
      .end(function(err, res) {
        if (err) { return done(err); }
        self.cookieThree = res.headers['set-cookie'][0];
        done();
      });
  });
};

