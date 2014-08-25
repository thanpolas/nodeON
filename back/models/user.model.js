/**
 * @fileOverview The base user model.
 */
var __ = require('lodash');
var BPromise = require('bluebird');
var config = require('config');
var mongoose = require('mongoose');
var appError = require('nodeon-error');
var log = require('logg').getLogger('app.model.User');
var helpers = require('nodeon-helpers');
var ModelMongo = require('nodeon-base').ModelMongoBase;

var Model = require('./model-base');
var userValid = require('./validators/user.valid');

/**
 * The base user model.
 *
 * @constructor
 * @extends {app.ModelMongo}
 */
var User = module.exports = ModelMongo.extendSingleton();

/**
 * The supported user roles.
 *
 * @enum {number}
 */
User.Role = {
  USER: 1,
  ADMIN: 2,
};

/** @define {string} default value for nulled passwords */
User.NULL_PASSWORD = 'null';

/**
 * Define the User schema
 * @type {Object}
 */
User.Schema = {
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  companyName: {type: String, default: ''},
  email: {type: String, required: true, trim: true, lowercase: true},
  password: {type: String, required: true},

  createdOn: {type: Date, default: Date.now},
  lastLogin: {type: Date, default: Date.now},
  lastIp: {type: String, default: ''},

  emailConfirmation: {
    key: {type: String, default: helpers.generateRandomString},
    expires: {
      type: Date,
      default: __.partial(ModelMongo.defaultDate, config.users.emailConfirmationExpires)
    }
  },
  resetPassword: {
    key: {type: String, default: ''},
    expires: {
      type: Date,
      default: null,
    }
  },

  // Roles and access
  isVerified: {type: Boolean, required: true, default: false},
  isDisabled: {type: Boolean, required: true, default: false},
  isAdmin: {type: Boolean, required: true, default: false},
};

/**
 * Initialize the model.
 *
 * @return {BPromise} A promise
 */
User.prototype.init = BPromise.method(function() {
  log.fine('init() :: initializing User Model...');

  this.schema = new mongoose.Schema(User.Schema);

  // define indexes
  this.schema.index({email: 1}, {unique: true});
  this.schema.index({createdOn: 1});

  // validations and middleware
  this.schema.pre('validate', this._setDefaultValues);
  this.schema.pre('save', this._hashPassword);

  this.schema.path('email').validate(userValid.email);

  // define methods
  this.schema.methods.deactivate = this._deactivate;
  this.schema.methods.activate = this._activate;
  this.schema.methods.verifyPassword = this._verifyPassword;

  // initialize model
  this.Model = mongoose.model(Model.Collection.USER, this.schema);

});

/**
 * Pre-validation middleware. Set any default values.
 *
 * @param  {Function(Error)} next callback
 * @private
 * @this {mongoose.Schema} Mongoose context.
 */
User.prototype._setDefaultValues = function(next){
  next();
};

/**
 * Pre-Save password filter, will one-way encrypt the value.
 *
 * @param  {Function(Error=)} next Callback.
 * @this {mongoose.Schema} Mongoose context.
 * @private
 */
User.prototype._hashPassword = function(next) {
  if(!this.isModified('password')) {
    return next();
  }

  helpers.hash(this.password, function(err, hash){
    if (err) {
      var dberr = new appError.Database(err);
      dberr.type = appError.Database.Type.CRYPTO;
      return next(dberr);
    }
    this.password = hash;
    next();
  }.bind(this));
};


/**
 * Deactivate the current user.
 *
 * @param  {Function(string=)} done Callback with optional error message.
 * [NOT IMPLEMENTED] @param  {string=} optReason Optionally provide a reason.
 * @this {mongoose.Schema} Mongoose context.
 * @private
 */
User.prototype._deactivate = function(done) {
  this.isDisabled = true;
  this.save(done);
};

/**
 * Activate the current user.
 *
 * @param  {Function(string=)} done Callback with optional error message.
 * @this {mongoose.Schema} Mongoose context.
 * @private
 */
User.prototype._activate = function(done) {
  this.isDisabled = false;
  this.save(done);
};

/**
 * Verify if a plain text password matches the one on record.
 *
 * @param {string} password The password we'll test.
 * @this {mongoose.Schema} Mongoose context.
 * @return {BPromise} Rejects if no  match.
 * @private
 */
User.prototype._verifyPassword = function(password) {
  var self = this;
  return new BPromise(function(resolve, reject) {
    helpers.hashVerify(self.password, password, function(isMatch) {
      if (isMatch) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

/**
 * Virtual getter for the user's full name.
 *
 * @return {string} The user's full name
 */
User.prototype._getFullName = function(){
  if (!this.firstName) {
    if (!this.lastName) {
      return 'No Name';
    } else {
      return this.lastName;
    }
  }

  if (!this.lastName) {
    return this.firstName;
  }

  return this.firstName + ' ' + this.lastName;
};
