/**
 * @fileOverview Users specific functionality.
 */

// var __ = require('lodash');
var Promise = require('bluebird');
var config = require('config');
var appError = require('nodeon-error');

var log = require('logg').getLogger('app.ent.UserForgot');

var UserEnt = require('./user.ent');
var Email = require('../../modules/email');
var helpers = require('../../util/helpers');

/**
 * The User Forgot Pass entity.
 *
 * @param {Object=} optUdo Optionally define the current handling user.
 * @constructor
 * @extends {app.ent.UserEnt}
 */
var Forgot = module.exports = UserEnt.extendSingleton();


/**
 * Perform forgot password operation.
 *
 * @param {string} email The user's email.
 * @return {Promise} A promise.
 */
Forgot.prototype.forgot = Promise.method(function(email) {
  var self = this;
  return this.readOne({email: email})
    .then(function(udo) {
      if (!udo) {
        var error = new appError.Validation();
        error.message = 'The email you entered does not exist in our database.';
        throw error;
      }
      return new Promise(function(resolve, reject) {
        udo.resetPassword.key = helpers.generateRandomString();
        udo.resetPassword.expires = Date.now() + config.users.passwordResetExpires;
        udo.save(function(err) {
          if (err) {
            var error = new appError.Database(err);
            error.message = 'An error occured, please retry';
            reject(error);
            return;
          }

          self._sendForgotEmail(udo).then(resolve, reject);
        });
      });
    });
});

/**
 * Send forgot password email to the user.
 *
 * @param {Mongoose} udo DB Document.
 * @return {Promise} A promise.
 * @private
 */
Forgot.prototype._sendForgotEmail = function(udo) {
  log.fine('_sendForgotEmail() :: Preparing forgot password email for:',
    udo.email);
  // var self = this;
  return new Promise(function(resolve, reject) {
    var email = Email.getInstance();
    var verifyToken = udo.resetPassword.key;

    var resetUrl = config.webserverUrl + '/forgot/' + verifyToken;
    resetUrl += '/' + udo._id;

    email.send(Email.Type.PASSWORD_RESET, udo.email, {
      resetUrl: resetUrl,
      requestip: '',
      requestDate: '',
    }).then(resolve).catch(reject);
  });
};

/**
 * Verify a reset token is valid for the given uid.
 *
 * @param {string} resetToken The reset token.
 * @param {string} uid The user id.
 * @return {Promise(Object)} A Promise with the UDO.
 */
Forgot.prototype.verifyResetToken = Promise.method(function(resetToken, uid) {
  return this.readOne({_id: uid}).then(function(udo) {
    if (!udo) {
      throw new appError.Authentication('User not found');
    }

    if (resetToken !== udo.resetPassword.key) {
      throw new appError.Authentication('Reset token does not match');
    }

    if (Date.now() > udo.resetPassword.expires) {
      throw new appError.Authentication('The token has expired');
    }

    return udo;
  });
});

/**
 * Perform password reset.
 *
 * @param {string} resetToken The reset token.
 * @param {string} uid The user id.
 * @param {string} newPassword The new pass.
 * @return {Promise(Object)} A Promise with the UDO.
 */
Forgot.prototype.resetPassword = Promise.method(function(resetToken, uid,
  newPassword) {
  return this.verifyResetToken(resetToken, uid)
    .then(function(udo) {
      return new Promise(function(resolve, reject) {
        udo.password = newPassword;
        udo.resetPassword.key = null;
        udo.resetPassword.expires = null;
        udo.save(function(err) {
          if (err) {
            var error = new appError.Database(err);
            error.message = 'An error occured, please retry';
            reject(error);
            return;
          }
          log.fine('resetPassword() :: Password was reset for:', udo.email);

          var email = Email.getInstance();
          email.send(Email.Type.PASSWORD_RESET_COMPLETE, udo.email, {
            udo: udo,
            changeDate: '',
            changeip: '',
          }).then(function() {
            resolve(udo);
          }).catch(reject);
        });
      });
    });
});
