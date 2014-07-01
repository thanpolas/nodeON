/**
 * @fileOverview Common API testing library.
 */
var req = require('supertest');
var config = require('config');

/**
 * Provides connectivity and network helpers.
 *
 * @param {string=} optHostname Optionally define a hostname.
 * @constructor
 */
var Web = module.exports = function(optHostname) {
  var port = config.webserver.port;
  var hostname = optHostname || 'http://localhost:' + port;
  // expose the supertest request object with the webserver's url predefined.
  this.req = req(hostname);
  this.hasAuthorized = false;
  this.udo = null;
};

/**
 * Setup the supertest request object.
 *
 * @param {string=} optHostname Optionally define a hostname.
 */
Web.setup = function(optHostname) {
  beforeEach(function() {
    var web = new Web(optHostname);
    this.req = web.req;
  });
};

/**
 * Helper for spliting the cookie into its' values.
 *
 * @param {string} cookie The cookie in full.
 * @return {Object} The cookie broken out in pieces
 * @static
 */
Web.splitCookie = function(cookie) {
  var equalPos = cookie.indexOf('=');
  var semicolonPos = cookie.indexOf(';');
  var finalPart = cookie.substr(semicolonPos + 2);
  var cookieValue = cookie.substr(equalPos + 1, semicolonPos - (equalPos + 1));

  return {
    name: cookie.substr(0, equalPos),
    value: cookieValue,

    // The session id starts at char 4 (after "s%3A") and ends at the
    // first dot.
    // connect.sid=s%3Ar0K8rj5TjBgff9lF0HIwkuzA.NIml5SjWE0TMTGhHm6cKwDisNWmY7tG4NNcoPZroMGY; Path=/
    sessionId: cookieValue.substr(4).split('.')[0],
    path: finalPart.split('=')[1],
  };
};

