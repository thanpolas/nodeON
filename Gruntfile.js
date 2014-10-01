/*jshint camelcase:false */

var globals = require('./back/core/globals');

var Email = require('./back/services/email');
var emailTemplate = require('./tasks/publish-email-templates.js');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  // Load per-task config from separate files.
  grunt.loadTasks('tasks');

  //
  //
  // Register tasks and aliases
  //
  //

  grunt.registerTask('test', [
    'mochaTest',
  ]);

  grunt.registerTask('css', 'SASS and combine minify', [
    'sass:dist',
    'cssmin:dist'
  ]);

  grunt.registerTask('deploy', 'Nodejitsu deploy ops', [
    'build',
    'shell:deploy',
  ]);

  grunt.registerTask('build', 'Build frontend app', [
    'css',
  ]);

  grunt.registerTask('frontend', [
    'parallel:web',
  ]);

  grunt.registerTask('web', [
    'express:web',
    'parallel:web',
  ]);

  grunt.registerTask('default', ['start', 'web']);

  grunt.registerTask('deploy', 'Runs after deployment on Heroku', [
    'clean:deploy',
  ]);

  grunt.registerTask('publish', 'Publish email templates', function() {
    var done = this.async();
    emailTemplate.update().then(done, done);
  });

  grunt.registerTask('start', 'Start all required services', ['startMongo', 'startRedis']);
  grunt.registerTask('stop', 'Stop all services', ['stopMongo', 'stopRedis']);

  grunt.registerTask('isHeroku', 'Checks if we are on Heroku', function() {
    if (!globals.isHeroku && globals.env !== globals.Environments.PRODUCTION) {
      grunt.fail.warn('Not on Heroku, stopping! Environment:' + globals.env);
    }
  });

  grunt.registerTask('send', 'send a test email', function(emailType, recipient) {
    var done = this.async();
    grunt.log.writeln('Sending email to: ' + recipient + ' Type: ' + emailType);
    var email = Email.getInstance();
    email.send(emailType, recipient, {verificationUrl: 'http://google.com'})
      .then(function(result){
        grunt.log.writeln('Success. Mandrill Response:');
        console.log(result);
        done();
      }).catch(function(err) {
        grunt.log.error('Failed to send email. Error:');
        console.error(err);
        console.error(err.stack);
        done(err);
      });
  });
};
