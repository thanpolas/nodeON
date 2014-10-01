/**
 * @fileOverview Populate db with required records
 */

var Promise = require('bluebird');

var log = require('logg').getLogger('app.scripts.initdb');

var UserEntity = require('../entities/user/user.ent');

var initdb = module.exports = {};

/**
 * Start DB population, will not overwrite existing records.
 *
 * @return {Promise} A Promise
 */
initdb.start = function() {
  log.fine('start() :: Starting DB Population...');
  return new Promise(function(resolve, reject) {
    initdb._createAdminUser()
      .then(resolve, reject);
  });
};

/**
 * Creates the admin user
 *
 * @return {Promise}
 * @private
 */
initdb._createAdminUser = function() {
  return new Promise(function(resolve, reject) {
    var userEnt = UserEntity.getInstance();
    var adminUdo = {
      email: 'bofh@awesomeapp.com',
      firstName: 'Admin',
      lastName: 'User',
      password: 'asdfgh',
      isAdmin: true,
      policy: 'admin',
    };
    return userEnt.delete({email: adminUdo.email}).then(function() {
      return userEnt.create(adminUdo).then(resolve, reject);
    });
  });
};
