/**
 * @fileOverview Common API testing library.
 */

var req = require('supertest');
var config = require('config');

/**
 * Provides connectivity and network helpers.
 *
 * @param {string} role The role, can be:
 *   "api" For api access.
 *   "web" For web access.
 * @constructor
 */
module.exports = function(role) {
  var port;
  switch(role) {
  case 'web':
    port = config.test.port;
    break;
  case 'api':
    port = config.test.port;
    break;
  default:
    throw new Error('Not valid role defined for supertest module:' + role);
  }
  var app = 'http://' + config.test.hostname + ':' + port;
  // expose the supertest request object with the webserver's url predefined.
  this.req = req(app);
  this.hasAuthorized = false;
  this.udo = null;
};
