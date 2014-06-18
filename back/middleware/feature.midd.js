/**
 * @fileOverview Feature switch middleware.
 */

var featureToggle = require('../core/feature-toggle.core');

var feature = module.exports = {};

/**
 * Check a feature is enabled
 *
 */
feature.has = function(feat) {
  return function(req, res, next) {
    if (featureToggle.isFeatureEnabled(feat)) {
      next();
      return;
    }
    // not, show 404
    res.status(404).render('404');
  };
};
