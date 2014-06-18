/**
 * @fileOverview The base Model Class all models extend from.
 */
var EventEmitter = require('events').EventEmitter;

var cip = require('cip');

var CeventEmitter = cip.cast(EventEmitter);

/**
 * The base Model Class all models extend from.
 *
 * @extends {events.EventEmitter}
 * @constructor
 */
var Model = module.exports = CeventEmitter.extend();

/**
 * All Collections (tables)
 * @enum {string}
 */
Model.Collection = {
  USER: 'user',
};

/**
 * Helper for default value of date types.
 *
 * @param  {number} plusTime
 * @return {number} The JS timestamp in the future.
 * @static
 */
Model.defaultDate = function(plusTime) {
  return new Date(Date.now() + plusTime);
};

/**
 * Return a properly formated and sanitized object.
 *
 * @this {mongoose.Schema} Mongoose context.
 * @return {Object} Properly formated Domain object.
 * @protected
 */
Model.prototype._toPublic = function() {
  var res = this.toObject({getters: true});

  delete res.__v;
  delete res._id;

  return res;
};
