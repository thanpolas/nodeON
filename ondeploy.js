/**
 * @fileOverview Executes on install, will delete folders if on Heroku.
 */
var rimraf = require('rimraf');
var async = require('async');
var __ = require('lodash');

var globals = require('./back/core/globals');

if (globals.isHeroku || globals.env === globals.Environments.PRODUCTION) {
  // on production, delete frontend sources

  async.parallel([
    __.partial(rimraf, 'front/static/scripts'),
    __.partial(rimraf, 'front/static/components'),
    __.partial(rimraf, 'front/static/mantriConf.json'),
    __.partial(rimraf, 'front/static/deps.js'),
    __.partial(rimraf, 'front/static/mng.src.js'),
  ], function(){
    console.log('onDeploy :: All sources deleted.');
  });
} else {
  console.log('onDeploy :: Not in production environment.');
}
