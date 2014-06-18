/**
 * @fileOverview Logging facilities, logfiles.
 */

// Nodejs libs.
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util');

var logg = require('logg');
var config = require('config');

var file = require('./file');

var initialized = false;

var logger = module.exports = new EventEmitter();

// setup local variables
var _fileLog = config.logger.file;
var _filename = config.logger.filename;
var _logLevel = config.logger.level;

/**
 * Initialize
 */
logger.init = function() {
  if (initialized) {return;}
  initialized = true;

  logger.setLevel();

  if (!config.logger.console) {
    logg.removeConsole();
  }

  // hook on logger
  try {
    logg.on('', logger._handleLog);
    // initialize syslog
  } catch(ex) {
    console.error('Logger failed:', util.inspect(ex));
  }

};


/**
 * set the minimum logging level to logg.
 *
 */
logger.setLevel = function() {
  logg.rootLogger.setLogLevel(_logLevel);
};

/**
 * Handle a captured log event.
 *
 * Sample logRecord object:
 *
 * level: 100
 * name: 'app.ctrl.process'
 * rawArgs: [ '_masterLoop() :: Loop: 2 processing: 0 concurrent jobs: 1' ]
 * date: Tue Apr 16 2013 18:29:52 GMT+0300 (EEST)
 * message: '_masterLoop() :: Loop: 2 processing: 0 concurrent jobs: 1' }
 *
 *
 * @param  {Object} logRecord As seen above.
 * @private
 */
logger._handleLog = function(logRecord) {

  // log level check.
  if (_logLevel > logRecord.level) {
    return;
  }

  // relay the record
  logger.emit('message', logRecord);

  var message = logg.formatRecord(logRecord, true);

  if (_fileLog) {
    logger._saveToFile(message);
  }

};

/**
 * Append a log message to the log file.
 *
 * @param  {string} message the message.
 * @private
 */
logger._saveToFile = function(message) {
  if (!file.isFile(_filename)) {
    // try to create it...
    try {
      file.write(_filename, '');
    } catch(ex) {
      console.error('\n\n********************\nFailed to write to log file! File: ', _filename, '\n\n');
      return;
    }
  }
  fs.appendFile(_filename, message);
};

