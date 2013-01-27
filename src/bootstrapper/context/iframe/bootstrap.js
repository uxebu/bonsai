define([
  '../../../runner/stage',
  '../script_loader',
  '../../../tools',
  '../../../runner/environment'
], function(Stage, makeScriptLoader, tools, Environment) {
  'use strict';

  return function(messageChannel, iframeWindow) {

    var doc = iframeWindow.document;

    function loadSubMovie(movieUrl, callback, movieInstance) {
      var iframe = doc.createElement('iframe');
      doc.documentElement.appendChild(iframe);
      var subWindow = iframe.contentWindow;
      var subMovie = movieInstance || new exports.Movie();
      var subEnvironment = stage.getSubMovieEnvironment(subMovie, movieUrl);

      // Need to call open()/close() before exposing anything on the window
      // (Opera would initiate a separate script context if we did it after)
      subWindow.document.open();
      subWindow.document.close();

      // Expose bonsai on sub-movie:
      tools.mixin(subWindow, subEnvironment.exports);

      subWindow.stage = subMovie;
      subMovie.root = this;

      var subLoader = makeScriptLoader(function(url, cb) {
        var script = subWindow.document.createElement('script');
        script.src = url;
        script.onload = function() { cb(null); };
        script.onerror = function() { cb('Could not load: ' + url); };
        subWindow.document.documentElement.appendChild(script);
      });

      subLoader.load(stage.assetBaseUrl.resolveUri(movieUrl), function(err) {
        if (err) {
          callback.call(subMovie, err);
        } else {
          callback.call(subMovie, null, subMovie);
        }
      });
    }
    function loadScriptUrls(scriptUrls, callback) {
      // need to close/open iframe for Opera
      doc.__loadCallback__ = function() {
        scriptUrls.length--;
        if (scriptUrls.length === 0) {
          callback();
          delete doc.__loadCallback__;
          doc.close();
        }
      };
      doc.write(
        tools.map(scriptUrls, function(url) {
          return '<script src="' + url + '" onload="__loadCallback__()"></script>';
        }).join('')
      );
    }

    var env = new Environment(iframeWindow);
    var stage = new Stage(messageChannel, env, loadScriptUrls, loadSubMovie);
    var exports = stage.env.exports;

  };
});
