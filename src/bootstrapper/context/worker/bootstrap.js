define([
  '../../../runner/stage',
  '../script_loader',
  '../../../tools',
  '../../../runner/require_wrapper',
  '../../../runner/environment'
], function(Stage, makeScriptLoader, tools, requireWrapper, Environment) {
  'use strict';

  function loadUrl(url, successCallback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        successCallback(this.responseText);
      } else {
        errorCallback(xhr.status + ' (' + xhr.statusText + ')');
      }
    };
    xhr.onerror = errorCallback;
    xhr.send(null);
  }

  return function(messageChannel) {
    function loadScriptUrls(scriptUrls) {
      importScripts.apply(null, scriptUrls);
    }

    function loadSubMovie(movieUrl, callback, movieInstance) {

      movieUrl = this.assetBaseUrl.resolveUri(movieUrl);

      var subMovie = movieInstance || new env.Movie();
      var subEnvironment = stage.getSubMovieEnvironment(subMovie, movieUrl);
      var subEnvExports = subEnvironment.exports;
      var functionArgNames = [];
      var functionArgValues = [];

      subMovie.root = this;

      /*
       We want to pass all subEnvExports so that they're directly accessible within
       the scope of the subMovie script.
       E.g. so a user can type Shape.rect() instead of bonsai.Shape.rect()
       Essentially, we're constructing an argument list. If done manually
       it would look like this:
       Function('bonsai', 'Shape', 'gradient', ...)
       .call(subMovie, subEnvExports.Shape, subEnvExports.gradient, ...)
       */

      for (var i in subEnvExports) {
        functionArgNames.push(i);
        functionArgValues.push(subEnvExports[i]);
      }

      loadUrl(movieUrl, function(code) {
        functionArgNames.push(code); // Actual code to execute
        Function.apply(null, functionArgNames).apply(subMovie, functionArgValues);
        callback.call(subMovie, null, subMovie);
      }, function(error) {
        callback.call(subMovie, error + ':' + movieUrl);
      });

    }

    if (!('console' in self)) {
      self.console = {
        log: function () {
          try {
            messageChannel.notifyRenderer({
              command: 'debug',
              data: [].map.call(arguments, function(item) {
                return typeof item == 'function' ? String(item) : item;
              })
            });
          } catch (e) {
            messageChannel.notifyRenderer({
              command: 'debug',
              data: 'Error logging argument: (' + e + ')'
            });
          }
        }
      };
    }

    var loader = makeScriptLoader(function(url, cb) {
      try {
        importScripts(url);
        cb(null);
      } catch(e) {
        console.log('>>ERROR WORKER', e);
      }
    });

    // wrap AMD loader (requirejs was loaded and configured in dev-mode already)
    var originalRequire = self.require;
    Object.defineProperty(self, 'require', requireWrapper);
    if (originalRequire) {
      /*
       We need to invoke the just registered setter for 'require' with the
       original require function (of require.js) to make it work correctly.
       */
      self.require = originalRequire;
    }

    var env = new Environment(self);
    var stage = new Stage(messageChannel, env, loadScriptUrls, loadSubMovie);

    stage.unfreeze();
  };
});
