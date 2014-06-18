/*jshint camelcase:false */
/**
 * @fileOverview Publishes the email templates to Mandrill.
 * https://mandrillapp.com/api/docs/index.nodejs.html
 */
var fs = require('fs');

var Promise = require('bluebird');
var Mandrill = require('mandrill-api/mandrill');
var config = require('config');
var lodash = require('lodash');
var log = require('logg').getLogger('app.email.Mandrill.templates');

var tpl = module.exports = {};

var mandrill = new Mandrill.Mandrill(config.mandrill.apikey);

var tplFolder = __dirname + '/../front/templates/email/';

/**
 * Will publish the email templates to Mandrill.
 *
 * @return {Promise} A promise.
 */
tpl.update = function() {
  return Promise.all([
    tpl.updateTemplate('email-verification.html', tpl._getMandrillOptions({
      name: 'email-verification',
      subject: 'www.awesomeapp.com Please verify your email',
    })),
    tpl.updateTemplate('password-reset.html', tpl._getMandrillOptions({
      name: 'password-reset',
      subject: 'www.awesomeapp.com Password reset request',
    })),
    tpl.updateTemplate('password-reset-complete.html', tpl._getMandrillOptions({
      name: 'password-reset-complete',
      subject: 'www.awesomeapp.com Your password has been reset',
    })),
  ]);
};

/**
 * Get a Mandrill Options object with defaults.
 *
 * @param {Object} options Override defaults.
 * @return {Object} Mandrill Options.
 */
tpl._getMandrillOptions = function(options) {
  return lodash.defaults(options, {
    name: null,
    subject: null,
    from_email: 'noreply@awesomeapp.com',
    from_name: 'awesomeapp Robot',
    text: 'Example text content',
    code: null,
    publish: true,
  });
};

/**
 * Read a template
 *
 * @param {string} filename The path to the file.
 * @return {Promise(string)} A promise with the file contents.
 * @private
 */
tpl._readFile = function(filename) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, {
      encoding: 'utf8',
    }, function (err, data) {
      if (err) {
        log.error('readFile() :: Error:', err);
        return reject(err);
      }
      resolve(data);
    });
  });
};

/**
 * Perform the template update with Mandrill API
 *
 * @param {string} filename The filename without a path of the template.
 * @param {Object} mandrillOptions Mandrill specific options.
 * @return {Promise} A promise.
 */
tpl.updateTemplate = function(filename, mandrillOptions) {
  filename = tplFolder + filename;

  return tpl._readFile(filename)
    .then(function (tplContents) {
      return new Promise(function(resolve, reject) {
        mandrillOptions.code = tplContents;
        mandrill.templates.update(mandrillOptions, resolve,
        function(err) {
          log.error('updateTemplate() :: Error:', err);
          reject(err);
        });
      });
    });
};
