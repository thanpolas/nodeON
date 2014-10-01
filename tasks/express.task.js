/**
 * @fileOverview The express task operation.
 */
module.exports = function(grunt) {
  grunt.config('express', {
    options: {
      // Override defaults here
    },
    web: {
      options: {
        script: 'back/app.js',
      }
    },
  });
};
