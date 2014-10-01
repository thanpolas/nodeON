/**
 * @fileOverview The cssmin task operation.
 */
module.exports = function(grunt) {
  grunt.config('cssmin', {
    dist: {
      files: {
        'front/static/styles/main.css': [
          'temp/main-sass.css',
        ]
      }
    }
  });
};
