module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        eqnull: true,
        browser: true,
        predef: [
          'afterEach',
          'beforeEach',
          'describe',
          'expect',
          'it',
          'jasmine',
          'require',
          'spyOn',
          'console',
          'runs',
          'xdescribe',
          'xit',
          'waitsFor'
        ]
      },
      all: ['Grunfile.js', 'src/**/*.js', 'test/**/(!goog.math.Matrix)*.js']
    },
    'closure-compiler': {
      release: {
        js: ['src/!(app_node).js'],
        jsOutputFile: 'build/bonsai.js',
        options: {
          transform_amd_modules: null,
          process_common_js_modules: null,
          common_js_module_path_prefix: 'src',
          common_js_entry_module: 'app_browser.js',
          create_source_map: '%outname%.map',
          source_map_format: 'V3',
          output_wrapper: '"%output%\n//@ sourceMappingURL=tooling-example.js.map"'
        }
      }
    },
    clean: {
      release: ['dist']
    }
  });

  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('release', ['clean', 'closure-compiler']);
};
