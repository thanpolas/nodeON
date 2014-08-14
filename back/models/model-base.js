/**
 * @fileOverview The base Model Class all models extend from.
 */
var Model = require('nodeon-base').ModelBase;

/**
 * The base Model Class all models extend from.
 *
 * @extends {nodeon-base.ModelBase}
 * @constructor
 */
var Model = module.exports = Model.extend();

/**
 * All Collections (tables)
 * @enum {string}
 */
Model.Collection = {
  USER: 'user',
};
