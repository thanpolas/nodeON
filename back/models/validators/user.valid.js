/**
 * @fileOverview User validation.
 */


var validator = require('validator');
// var sanitize = require('validator').sanitize;

require('./validator');

var uv = module.exports = {};

/**
 * email validator.
 *
 * @param  {string} email the email to validate.
 * @return {boolean}
 */
uv.email = function(email) {
  return validator.isEmail(email);
};
