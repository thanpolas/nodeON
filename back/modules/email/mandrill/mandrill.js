/*jshint camelcase:false */
/**
 * @fileOverview Mandrill email API implementation.
 */

var config = require('config');
var __ = require('lodash');
var cip = require('cip');
var BPromise = require('bluebird');
var Mandrill = require('mandrill-api/mandrill');
var log = require('logg').getLogger('app.email.Mandrill');

// var tpl = require('./templates');
function noop() {}

var Mand = module.exports = cip.extendSingleton(function() {
  var apiKey = config.mandrill.apikey || '';
  log.fine('Ctor() :: Initializing Mandrill using key:',
    apiKey.substr(0, 5) + '...');
  this.mandrill = new Mandrill.Mandrill(apiKey);
});

/** @enum {string} email types, maps to mandrill templates */
Mand.Type = {
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  PASSWORD_RESET_COMPLETE: 'password-reset-complete',
};

Mand.prototype.init = function() {
  return BPromise.resolve();
};

/**
 * Send an email.
 *
 * @param {app.email.Mandrill.Type} type email type.
 * @param {string} recipient The email recipient.
 * @param {Object} tplVars key / value pairs.
 * @return {BPromise(Object)} a promise with the response from Mandrill.
 */
Mand.prototype.send = function(type, recipient, tplVars) {
  var self = this;
  return new BPromise(function(resolve) {

    log.fine('send() :: Sending email to:', recipient, 'type:', type);

    // transform template vars.
    var mergeVars = [];
    if (__.isObject(tplVars)) {
      __.forOwn(tplVars, function(value, key) {
        mergeVars.push({
          name: key,
          content: value,
        });
      });
    }
    var mandrillOpts = {
      template_name: type,
      template_content: [
        {
          name: 'example name',
          content: 'example content'
        }
      ],
      message: {
        to: [{
          email: recipient,
          type: 'to',
        }],
        global_merge_vars: mergeVars,
      },
    };

    // FIXME make this a job
    resolve();
    self.mandrill.messages.sendTemplate(mandrillOpts, noop, function(err) {
      log.error('send() :: Mandrill Error:', err);
    });
  });
};
