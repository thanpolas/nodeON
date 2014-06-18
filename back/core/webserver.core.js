/**
 * @fileOverview The HTTP webserver.
 */

var http = require('http');

var Promise = require('bluebird');
var log = require('logg').getLogger('app.core.webserver');

var web = module.exports = {};

/** @type {http} The http instance */
web.http = null;

/**
 * Init the webserver.
 *
 * @param {Express} app the Express instance.
 */
web.init = function(app) {
  web.http = http.createServer(app);
};

/**
 * Start the webserver.
 *
 * @param {Express} app the Express instance.
 * @return {Promise} A promise.
 */
web.start = function(app) {
  return new Promise(function(resolve, reject) {
    web.http.on('clientError', function(err) {
      log.warn('start() :: Client Error. Exception:', err);
    });
    web.http.on('error', function(err) {
      log.error('start() :: Failed to start web server. Exception:', err);
      reject(err);
    });

    web.http.listen(app.get('port'), function(){
      log.fine('start() :: Webserver launched. Listening on port: ' +
        app.get('port'));
      resolve();
    });
  });
};
