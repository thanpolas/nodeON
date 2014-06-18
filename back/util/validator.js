/**
 * @fileOverview Validator package extensions
 * @see  https://github.com/chriso/validator.js#extensions
 */

var validator = require('validator');

/**
 * Sanitizes strings comming from form submittion.
 * It will:
 *   - toString()
 *   - Trim
 *   - Optionally limit to defined limit.
 *   
 * @param {string|*} value The value to sanitize.
 * @param {number=} optLimit optionally define a max string lentgh.
 * @return {string} A sanitized string.
 */
validator.extend('toWebstring', function(value, optLimit) {
  var str = validator.toString(value);
  str = validator.trim(str);
  if (typeof optLimit === 'number') {
    str = str.substr(0, optLimit);
  }
  return str;
});
