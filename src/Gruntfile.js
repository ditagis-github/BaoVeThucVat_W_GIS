module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
              banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
              src: 'public/javascripts/account/controllers/homeController.js',
              dest: 'build/<%= pkg.name %>.min.js'
            }
          }
    });
    grunt.registerTask('default', ['uglify'] );
};