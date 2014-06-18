/**
 * @fileOverview The base Middleware Class, all Middlewares extend from.
 */

var EventEmitter = require('events').EventEmitter;
var cip = require('cip');

var CeventEmitter = cip.cast(EventEmitter);

/**
 * The base Middleware Class, all Middlewares extend from.
 *
 * @constructor
 * @extends {events.EventEmitter}
 */
module.exports = CeventEmitter.extend();
