/**
 * @fileOverview Define relations between data objects.
 */
var EventEmitter = require('events').EventEmitter;

var cip = require('cip');

var CEventEmitter = cip.cast(EventEmitter);

var conn = require('../core/database.core').getInstance();

/**
 * Define relations between data objects.
 *
 * @constructor
 * @extends {events.EventEmitter}
 */
var Relation = module.exports = CEventEmitter.extendSingleton(function(){
  EventEmitter.call(this);

  conn.on('init', this.init.bind(this));
});

/**
 * Define relations here.
 *
 */
Relation.prototype.init = function() {

};
