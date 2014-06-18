/**
 * @fileOverview Feature Toggles.
 */
var features = require('feature-toggles');

// var globals = require('./globals');

var toggles = module.exports = {};

features.load({
  // Use any arbitrary name to toggle features
  user: true,

  // howto exclude from production
  // notReadyYet: globals.env !== globals.Environments.HEROKU,
});

/**
 * Check if a feature is enabled.
 *
 * @param {string} feature The feature to test.
 * @return {boolean} Yes / no.
 */
toggles.isFeatureEnabled = function(feature) {
  return features.isFeatureEnabled(feature);
};
