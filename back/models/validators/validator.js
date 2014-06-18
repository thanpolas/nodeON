/**
 * @fileOverview Main validator library, must be included by all
 *   validators
 */

var Validator = require('validator').Validator;

var valid = module.exports = {};


/**
 * Initialize validators
 *
 */
valid.init = function() {
  // setup Validator so it won't throw errors
  // https://github.com/chriso/node-validator#error-handling
  Validator.prototype.error = function (msg) {
    this._errors.push(msg);
    return this;
  };
  Validator.prototype.getErrors = function () {
    return this._errors;
  };
};
