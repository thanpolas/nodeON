/**
 * @fileOverview The entities base class.
 */
var __ = require('lodash');

var EntityCrudMongoose = require('node-entity').Mongoose;
var appError = require('nodeon-error');
var log = require('logg').getLogger('app.ent.Base');


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
    .bind(this)
    .catch(this._normalizeError);
};

/**
 * Wrap the default "update" method,
 * taking care to normalize any error messages.
 *
 * @param {Object|string} query The query.
 * @param {Object} itemData The data to use for updating.
 * @param {Function(?app.error.Abstract, Mongoose.Model=)} done callback.
 * @override
 */
Entity.prototype._update = function(query, itemData) {
  // stub to default for now until Mongoose is normalized
  return EntityCrudMongoose.prototype._update.call(this, query, itemData)
    .bind(this)
    .catch(this._normalizeError);
};

/**
 * Normalize errors comming from the db
 *
 * @param {Object} err Error as provided by the orm.
 * @return {Promise} A Promise.
 * @private
 * @throws {app.error.ErrorBase} always.
 */
Entity.prototype._normalizeError = function(err) {
  log.fine('_normalizeError() :: Error intercepted:', err.code, err.message);
  var error = new appError.Validation(err);
  switch(err.code) {
  case 11000:
    error.message = 'This email is already registered';
    break;
  case 11001:
    error.message = 'Duplicate record found';
    break;
  }

  // check for mongoose specific validation errors
  if (err.name === 'ValidationError') {
    __.forOwn(err.errors, function(value) {
      error.errors.push(value);
    });
  }

  throw error.toApi();
};
