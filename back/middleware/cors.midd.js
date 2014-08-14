/**
 * @fileOverview Granular CORS control Middleware.
 */

var util = require('util');

var helpers = require('nodeon-helpers');

// var log = require('logg').getLogger('app.midd.Cors');

var Middleware = require('./middleware');

/**
 * The Cors Middleware.
 *
 * @contructor
 * @extends {app.Middleware}
 */
var Cors = module.exports = function(){
  Middleware.apply(this, arguments);
};
util.inherits(Cors, Middleware);
helpers.addSingletonGetter(Cors);

/**
 * CORS Middleware
 *
 * @see http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Function(Error=)} next passing control to the next middleware.
 */
Cors.prototype.allowCrossDomain = function(req, res, next) {
  var acceptHeaders = 'Content-Type, Authorization, X-Api-Token, ' +
    'x-requested-with, Accept';
  res.header('Access-Control-Allow-Origin', '*');// config.webserverUrl);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', acceptHeaders);

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
};
