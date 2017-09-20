module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      compile: {

        // !! You can drop your app.build.js config wholesale into 'options'
        options: {
          appDir: "public/javascripts/",
          baseUrl: ".",
          dir: "target/",
          optimize: 'uglify',
          mainConfigFile:'public/javascripts/ditagis/main.js',
          logLevel: 0,
          findNestedDependencies: true,
          fileExclusionRegExp: /^\./,
          inlineText: true
        }
      }
    }
    // uglify: {
    //   min: {
    //     files: grunt.file.expandMapping(['public/**/*.js', 'path2/**/*.js'], 'destination/', {
    //       rename: function (destBase, destPath) {
    //         return destBase + destPath.replace('.js', '.min.js');
    //       }
    //     })
    //   }
    // }
  });
  grunt.registerTask('default', ['uglify','requirejs']);
};