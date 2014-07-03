/**
 * @fileOverview The base Model Class mongo models extend from.
 */
var Model = require('./model');

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
