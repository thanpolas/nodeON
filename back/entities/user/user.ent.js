/**
 * @fileOverview Users specific functionality.
 */

var __ = require('lodash');
var BPromise = require('bluebird');
var config = require('config');
var appError = require('nodeon-error');
var helpers = require('nodeon-helpers');
var EntityBase = require('nodeon-base').EntityBase;

var log = require('logg').getLogger('app.ent.User');

var UserModel = require('../../models/user.model');
var userModel = UserModel.getInstance();
var Email = require('../../services/email');

/**
 * The User entity.
 *
 * @param {Object=} optUdo Optionally define the current handling user.
 * @constructor
 * @extends {app.EntityBase}
 */
var User = module.exports = EntityBase.extendSingleton(function() {
  this.setModel(userModel.Model);
  // CRUD middleware
  this.create.before(this.setPassword.bind(this));
  this.create.before(this._createVerifyToken.bind(this));

  this.method('register', this.create.bind(this));
  this.method('editProfile', this._editProfile.bind(this));

  this.register.after(this._sendVerificationEmail.bind(this));
  this.editProfile.before(this._checkProfilePassword.bind(this));
  this.editProfile.after(this._checkProfileEmail.bind(this));
});

/**
 * Check if password needs to be set
 *
 * @param {Object} itemData The data to use for creating.
 * @override
 */
User.prototype.setPassword = function(itemData) {
  // take care of password field if creator is admin
  if (this.udo && this.udo.isAdmin) {
    itemData.password = UserModel.NULL_PASSWORD;
  }
};

/**
 * Create a UDO for public use by the UDO owner.
 *
 * @param  {Mongoose.Model} udo The raw udo.
 * @return {Object} A safe to use UDO.
 * @static
 */
User.secureOwnUdo = function(udoDocument) {
  var udo = Object.create(null);
  udo.id = udoDocument.id;
  udo.email = udoDocument.email;
  udo.name = udoDocument.name;
  udo.isVerified = udoDocument.isVerified;
  return udo;
};

/**
 * Create a UDO for public use by other users.
 *
 * @param  {Mongoose.Model} udo The raw udo.
 * @return {Object} A safe to use UDO.
 * @static
 */
User.securePublicUdo = function(udoDocument) {
  var udo = User.secureOwnUdo(udoDocument);
  delete udo.email;
  delete udo.isVerified;
  return udo;
};

/**
 * Before create middleware, creates email verification token.
 *
 * @param {Object} udo The udo.
 */
User.prototype._createVerifyToken = function (udo) {
  udo.emailConfirmation = {
    key: helpers.generateRandomString(16),
  };
};

/**
 * Send verification email to the user.
 *
 * @param {Object} udo UDO as passed by consumer.
 * @param {Mongoose} udoDoc DB Document.
 * @return {BPromise} A promise.
 * @private
 */
User.prototype._sendVerificationEmail = function(udo, udoDoc) {
  log.fine('_sendVerificationEmail() :: Preparing verification email for:',
    udo.email);
  // var self = this;
  return new BPromise(function(resolve, reject) {
    var email = Email.getInstance();
    var verifyToken = udo.emailConfirmation.key;

    var verificationUrl = config.webserverUrl + '/verify/' + verifyToken;
    verificationUrl += '/' + udoDoc._id;

    email.send(Email.Type.EMAIL_VERIFICATION, udo.email, {
      verificationUrl: verificationUrl,
    }).then(resolve).catch(reject);
  });
};

/**
 * Verifies if a given token matches a user.
 *
 * @param {string} verifyToken The verification token.
 * @param {string} uid User Id.
 * @return {BPromise} A promise.
 */
User.prototype.verifyToken = function(verifyToken, uid) {
  var self = this;
  return this.readOne(uid).then(function(udo) {
    if (!__.isObject(udo)) {
      throw new Error('No mathcing user found');
    }
    if (verifyToken !== udo.emailConfirmation.key) {
      throw new Error('Does not match');
    }

    return self.update(uid, {isVerified: true});
  });
};

/**
 * Checks if password was changed, will populate "params" with "password"
 * if everything checks out.
 *
 * @param {Object} params Data from the client.
 * @param {Object} udo The UDO of the user to edit.
 * @return {BPromise} A promise.
 * @private
 */
User.prototype._checkProfilePassword = BPromise.method(function(params, udo) {
  if (!params.oldPassword || !params.oldPassword.length) {
    return;
  }

  var self = this;
  return self.readOne({_id: udo._id})
    .then(function(resUdo) {
      return resUdo.verify(params.oldPassword)
        .then(function() {
          params.password = params.newPassword;
        })
        .catch(function() {
          var error = new appError.Authentication('Old Password is wrong.');
          error.type = appError.Authentication.Type.PASSWORD;
          throw error;
        });
    });
});

/**
 * Profile edit submission
 *
 * @param {Object} params Data from the client.
 * @param {Object} udo The UDO of the user to edit.
 * @return {BPromise} A promise.
 * @private
 */
User.prototype._editProfile = BPromise.method(function(params, udo) {
  if (params.email && params.email.length && params.email !== udo.email) {
    params.isVerified = false;
    params.emailConfirmation = {
      key: helpers.generateRandomString(),
      expires: Date.now() + config.users.emailConfirmationExpires,
    };
  }
  return this.update({_id: udo._id}, params);
});

/**
 * Check if email changed and restart verification process.
 *
 * @param {Object} params Data from the client.
 * @param {Object} udo The UDO of the user to edit.
 * @param {Mongoose.Document} newUdo Mongoose UDO.
 * @return {BPromise} A promise.
 * @private
 */
User.prototype._checkProfileEmail = BPromise.method(function(params, udo, newUdo) {
  if (newUdo.email !== udo.email) {
    return this._sendVerificationEmail(newUdo, newUdo);
  }
});
