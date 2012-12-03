define(function() {
  'use strict';

  var requirejs;
  var waitingCallbacks = [];
  var requireFunc = function() {
    var args = [].slice.call(arguments);
    var callback = args.pop();
    waitingCallbacks.push(callback);
    args.push(function() {
      waitingCallbacks.splice(waitingCallbacks.indexOf(callback), 1);
      var module = callback.apply(this, arguments);
      if (waitingCallbacks.length == 0) {
        stage.unfreeze();
      }
      return module;
    });
    return requirejs.apply(this, args);
  };
  var requireWrapperGet = function() {
    if (typeof requirejs == 'function') {
      return requireFunc;
    } else {
      return requirejs;
    }
  };
  var requireWrapperSet = function(val) {
    // save original require function
    requirejs = val;
    requireFunc.config = requirejs.config;
  };

  return {
    enumerable: true,
    get: requireWrapperGet,
    set: requireWrapperSet
  };
});