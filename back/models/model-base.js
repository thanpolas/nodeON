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
