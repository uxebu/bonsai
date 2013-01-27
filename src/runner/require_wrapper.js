define(function() {
  'use strict';

  var requirejs;
  var requirejsConfigured = false;
  var waitingCallbacks = [];

  return function(loaderCallback) {
    var requireFunc = function() {
      var args = [].slice.call(arguments);
      var callback = args.pop();
      waitingCallbacks.push(callback);
      args.push(function() {
        waitingCallbacks.splice(waitingCallbacks.indexOf(callback), 1);
        var module = callback.apply(this, arguments);
        if (waitingCallbacks.length == 0) {
          loaderCallback();
        }
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
