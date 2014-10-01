/**
 * @fileOverview The watch task operation.
 */
module.exports = function(grunt) {
  grunt.config('watch', {
    frontend: {
      options: {
        livereload: true
      },
      files: [
        // triggering livereload when the .css file is updated
        // (compared to triggering when sass completes)
        // allows livereload to not do a full page refresh
        'front/static/styles/*.css',
        'front/templates/**/*.jade',
        'front/static/scripts/*.js',
        'front/static/*.js',
        'front/static/img/**/*'
      ]
    },
    stylesSass: {
      files: [
        'front/styles/**/*.scss'
      ],
      tasks: [
        'sass',
        'cssmin'
      ]
    },
    web: {
      files: [
        'backend/**/*.js',
        'config/*',
        'test/**/*.js',
      ],
      tasks: [
        'express:web'
      ],
      options: {
        nospawn: true, // Without this option specified express won't be reloaded
      }
    },
  });
};
