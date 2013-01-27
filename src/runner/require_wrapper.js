define(function() {
  'use strict';

  var requirejs;
  var requirejsConfigured = false;

  return function(getLoaderCallback) {
    var requireFunc = function() {
      var loaderCallback = getLoaderCallback();
      var args = [].slice.call(arguments);
      var callback = args.pop();
      args.push(function() {
        var module = callback.apply(this, arguments);
        loaderCallback();
        return module;
      });
      return requirejs.apply(this, args);
    };
    var requireWrapperGet = function() {
      var requirejsRef = typeof requirejs == 'function' ? requireFunc : requirejs;
      if (requirejsRef && !requirejsConfigured) {
        // configure requirejs once, when available (just for built versions)
        if (typeof stage.options.baseUrl !== 'undefined' && typeof stage.options.requireConfig !== 'undefined') {
          requirejsRef.config(stage.options.requireConfig);
          requirejsRef.config({
            baseUrl: stage.options.baseUrl
          });
        }
        requirejsConfigured = true;
      }
      return requirejsRef;
    };
    var requireWrapperSet = function(val) {
      // save original require function
      requirejs = val;
      // expose "require.config" too
      requireFunc.config = requirejs.config;
    };

    return {
      enumerable: true,
      get: requireWrapperGet,
      set: requireWrapperSet
    };
  };
});
