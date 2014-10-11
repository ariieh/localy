module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [
          'lib/client/neighborhoodstyles.js',
          'lib/client/helper.js',
          'lib/client/mathlib.js',
          'lib/client/locator.js',
          'lib/client/index.js',
          'lib/client/localy.js',
          'lib/client/backbone/*.js',
          'lib/client/backbone/**/*.js'
        ],
        dest: 'lib/client/build/development.js',
      }
    },

    sass: {
      options: {
        sourceMap: false
      },
      dist: {
        files: {
          'stylesheets/custom.css': 'stylesheets/custom.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat', 'sass']);
};
