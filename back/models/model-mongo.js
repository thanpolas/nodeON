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
module.exports = Model.extend(function() {
  /** @type {?mongoose.Schema} Instance of mongoose Schema */
  this.schema = null;
});
