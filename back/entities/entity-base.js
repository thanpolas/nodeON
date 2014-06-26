/**
 * @fileOverview The entities base class.
 */
var __ = require('lodash');

var EntityCrudMongoose = require('node-entity').Mongoose;
var log = require('logg').getLogger('app.ent.Base');

var appError = require('../util/error');

/**
 * The base Entity Class all entities extend from.
 *
 * @constructor
 * @extends {crude.Entity}
 */
var Entity = module.exports = EntityCrudMongoose.extend();

/**
 * Wrap the default "create" method,
 * taking care to normalize any error messages.
 *
 * @param {Object} itemData The data to use for creating.
 * @param {Function(?app.error.Abstract, Mongoose.Model=)} done callback.
 * @override
 */
Entity.prototype._create = function(itemData) {
  // stub to default for now until Mongoose is normalized
  return EntityCrudMongoose.prototype._create.call(this, itemData)
    .catch(this._normalizeErrors.bind(this));
};

/**
 * Normalize errors comming from the db
 *
 * @param {Object} err Error as provided by the orm.
 * @return {Promise} A Promise.
 * @private
 * @throws {app.error.ErrorBase} always.
 */
Entity.prototype._normalizeErrors = function(err) {
  log.fine('_normalizeErrors() :: Error intercepted:', err.message);
  var error = new appError.Validation(err);
  switch(err.code) {
  case 11000:
    error.message = 'This email is already registered';
    break;
  }

  // check for mongoose specific validation errors
  if (err.name === 'ValidationError') {
    __.forOwn(err.errors, function(value) {
      error.errors.push(value);
    });
  }

  throw error;
};
