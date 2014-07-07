/**
 * @fileOverview The base Model Class mongo models extend from.
 */
var Model = require('./model-base');

/**
 * The base Model Class mongo models extend from.
 *
 * @constructor
 * @extends {app.Model}
 */
var ModelMongo = module.exports = Model.extend(function() {
  /** @type {?mongoose.Schema} Instance of mongoose Schema */
  this.schema = null;

  /** @type {?mongoose.Model} The mongoose Model ctor */
  this.Model = null;
});

/**
 * Helper for default value of date types.
 *
 * @param  {number} plusTime
 * @return {number} The JS timestamp the future.
 * @static
 */
ModelMongo.defaultDate = function(plusTime) {
  return Date.now() + plusTime;
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
