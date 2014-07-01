/**
 * @fileOverview Redirect middleware, forces usage of a single host.
 */

var util = require('util');

// var log = require('logg').getLogger('app.midd.Redirect');

var Middleware = require('./middleware');
var helpers = require('../util/helpers');

/**
 * The Redirect middleware, forces usage of a single host.
 *
 * @contructor
 * @extends {app.Middleware}
 */
var Redirect = module.exports = function(){
  Middleware.apply(this, arguments);
};
util.inherits(Redirect, Middleware);
helpers.addSingletonGetter(Redirect);

/**
 * Force a redicetion for the www. hostname.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Function(Error=)} next passing control to the next middleware.
 */
Redirect.prototype.forceWww = function(req, res, next) {

  var host = req.header('host');

  if (host.match(/^www\.yourdomain\.com[.]*/i)) {
    next();
    return;
  }

  res.redirect(301, 'http://www.yourdomain.com');
};
