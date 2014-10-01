/**
 * @fileOverview The sass task operation.
 */
module.exports = function(grunt) {
  grunt.config('sass', {
    options: {
    },
    dist: {
      files: [{
        'temp/main-sass.css': 'front/styles/boot.scss',


        // expand: true,
        // cwd: 'front/',
        // src: [
        //   'styles/*.scss',
        //   'components/sass-bootstrap/lib/*.scss',
        // ],
        // dest: '../static/styles',
        // ext: '.css',
      }]
    }
  });
};
