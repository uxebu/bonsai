define([
  '../version'
], function(version) {
  'use strict';

  var workerCode = 'this.onmessage=function(e){postMessage(e.data)}';

  var supportsWorkerWithDataUri = (function() {
    try {
      var worker = new Worker('data:application/javascript,' + encodeURIComponent(workerCode));
      worker.onmessage = function() {
        worker.terminate();
      };
      worker.postMessage('');
      return true;
    } catch (e) {
      return false;
    }
  })();

  var supportsWorkerWithBlobUri = (function() {
    var blob, blobUrl, url, worker;
    try {
      // worker.terminate can just be executed after the worker was created
      // and it'll stay in memory. This is why we need to wait for postMessage
      // before we destroy it.
      blob = new Blob([workerCode], {'type': 'text\/javascript'});
      url = window.URL || window.webkitURL;
      blobUrl = url.createObjectURL(blob);
      worker = new Worker(blobUrl);
      worker.onmessage = function() {
        worker.terminate();
        url.revokeObjectURL(blobUrl);
      };
      worker.postMessage('');
      return true;
    } catch (e) {
      if (blobUrl) {
        url.revokeObjectURL(blobUrl);
      }
      return false;
    }
  })();

  return {
    /**
     * Returns a data/blob-URL of the passed IIFE, if the browser supports it.
     * If not it returns an empty string.
     *
     * @private
     * @param {Function} [workerFunction] that should be the data-/blob-URL
     * @return {String} data-/blob-URL or empty String
     */
    getUrl: function(workerFunction) {
      var url = window.URL || window.webkitURL;
      // execute the function immediately
      var workerFuncString = '(' + workerFunction + ')();';
      if (supportsWorkerWithBlobUri) {
        var blob = new Blob([workerFuncString], {'type': 'text\/javascript'});
        return url.createObjectURL(blob);
      } else if (supportsWorkerWithDataUri) {
        return 'data:application/javascript,' + encodeURIComponent(workerFuncString);
      } else {
        return '';
      }
    }
  }
});
