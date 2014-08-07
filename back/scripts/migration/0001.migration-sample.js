/**
 * Migrate X Y Z.
 */

// manually define the NODE_ENV environment variable
process.env.NODE_ENV = 'scripts';

var app = require('../../..');

var migrate = module.exports = {};

migrate.init = function () {
  app.init({
    noweb: true,
    noEmail: true,
    noWebsocket: true,
    noWebsocketEcho: true,
  })
    .then(migrate.action);
};

/**
 * Perform the migration
 *
 */
migrate.action = function () {
  // TODO
};

migrate.init();
