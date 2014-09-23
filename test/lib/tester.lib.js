/**
 * @fileOverview Main testing helper lib, exporting fixtures, helper functions
 *   etc. All UNIT tests must require it.
 */
// manually define the NODE_ENV environment variable
process.env.NODE_ENV = 'testing';

// When on testing enable bluebird's Long Stack Traces
var Promise = require('bluebird');
Promise.longStackTraces();

// The application.
var app = require('../..');

var tester = module.exports = {};

tester.setup = null;
tester.teardown = null;

if (global.setup) {
  tester.setup = setup;
  tester.teardown = teardown;
} else {
  tester.setup = beforeEach;
  tester.teardown = afterEach;
}

// global setup
var init = false;

/**
 * Boot application.
 *
 */
tester.init = function() {
  tester.setup(function(done) {
    if (init) {return done();}
    init = true;

    app.init({
      log: true,
      stubMail: true,
      security: false,
    }).then(done.bind(null, null), done);
  });
};

/**
 * Have a Cooldown period between tests.
 *
 * @param {number} seconds cooldown in seconds.
 * @return {Function} use is beforeEach().
 */
tester.cooldown = function(seconds) {
  return function(done) {
    setTimeout(done, seconds);
  };
};

/** @type {RegExp} Test an ISO8601 type date */
tester.reIso8601 = /^(\d{4})(-(\d{2}))??(-(\d{2}))??(T(\d{2}):(\d{2})(:(\d{2}))??(\.(\d+))??(([+-]{1}\d{2}:\d{2})|Z)??)??$/;
