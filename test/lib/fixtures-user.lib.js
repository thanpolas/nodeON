/**
 * @fileOverview Setup User Fixtures
 */
var Promise = require('bluebird');

var tester = require('./tester.lib');
var UserEnt = require('../../back/entities/user/user.ent');
var DomainEnt = require('../../back/entities/custom-domain.ent');
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

  tester.setup(function() {
    this.userEnt = UserEnt.getInstance();

    var web = new Web('api');
    this.req = web.req;
  });

  tester.setup(function(done) {
    Promise.all([
      this.userEnt.delete({email: userfix.one.email}),
      this.userEnt.delete({email: 'new@demo.com'}),
      this.userEnt.delete({email: userfix.three.email}),
    ]).then(done.bind(null, null), done);
  });

  tester.setup(function(done) {
    var self = this;
    this.userEnt.create(userfix.oneFull)
      .then(function(userDataObject) {
        self.udo = userDataObject;
      }).then(done, done);
  });
  tester.setup(function(done) {
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
  tester.setup(function(done) {
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
  tester.setup(function(done) {
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

/**
 * Setup custom domains.
 *
 */
fixtures.domains = function() {
  tester.setup(function(done) {
    this.domainEnt = DomainEnt.getInstance();
    Promise.all([
      this.domainEnt.delete({name: 'one'}),
      this.domainEnt.delete({name: 'two'}),
      this.domainEnt.delete({name: 'three'}),
    ]).then(done.bind(null, null), done);
  });
  tester.setup(function(done) {
    var self = this;
    this.domainEnt.create({
      name: 'one',
      user: this.udo.id,
      hostname: '',
    }).then(function(domainItem) {
      self.domainItem = domainItem;
    }).then(done, done);
  });
  tester.setup(function(done) {
    var self = this;
    this.domainEnt.create({
      name: 'two',
      hostname: 'twotwo',
      user: this.udo.id,
    }).then(function(domainItem) {
      self.domainItemTwo = domainItem;
    }).then(done, done);
  });
};

/**
 * Helper for spliting the cookie into its' values.
 *
 * @param {string} cookie The cookie in full.
 * @return {Object} The cookie broken out in pieces
 */
fixtures._splitCookie = function(cookie) {
  // connect.sid=s%3Ar0K8rj5TjBgff9lF0HIwkuzA.NIml5SjWE0TMTGhHm6cKwDisNWmY7tG4NNcoPZroMGY; Path=/

  var equalPos = cookie.indexOf('=');
  var semicolonPos = cookie.indexOf(';');
  var finalPart = cookie.substr(semicolonPos + 2);
  var cookieValue = cookie.substr(equalPos + 1, semicolonPos - (equalPos + 1));

  return {
    name: cookie.substr(0, equalPos),
    value: cookieValue,

    // The session id starts at char 4 (after "s%3A") and ends at the
    // first dot.
    sessionId: cookieValue.substr(4).split('.')[0],
    path: finalPart.split('=')[1],
  };
};
