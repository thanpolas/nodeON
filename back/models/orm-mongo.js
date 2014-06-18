/**
 * @fileOverview Abstraction layer for mongoose.
 *
 */

// var __ = require('lodash');
var mongoose = require('mongoose');

// var log = require('logg').getLogger('app.model.orm');

var orm = module.exports = mongoose;

/**
 * Helper for default value of date types.
 *
 * @param  {number} plusTime
 * @return {number} The JS timestamp the future.
 */
orm.defaultDate = function(plusTime) {
  return Date.now() + plusTime;
};
