define([
  '../version'
], function(version) {
  'use strict';

  var supportsWorkerWithDataUri = (function() {
    try {
      var worker = new Worker('data:application/javascript,' + encodeURIComponent('void 0;'));
      worker.terminate();
      return true;
    } catch(e) {}
    return false;
  })();

  var supportsWorkerWithBlobUri = (function() {
    var blob, blobUrl, url, worker;
    try {
      blob = new Blob();
      url = window.URL || window.webkitURL;
      blobUrl = url.createObjectURL(blob);
      worker = new Worker(blobUrl);
      worker.terminate();
      return true;
    } catch(e) {
      if (blobUrl) {
        url.revokeObjectURL(blobUrl);
      }
    }
    return false;
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
