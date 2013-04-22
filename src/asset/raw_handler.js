/**
 * Type handler for Raw data (txt, json, html ...)
 */
define(['./asset_handler'], function(AssetHandler) {
  'use strict';

  function RawHandler() {
    AssetHandler.apply(this, arguments);
  }

  RawHandler.prototype = Object.create(AssetHandler.prototype);

  RawHandler.prototype.loadResource = function(resource, doDone, doError) {

    var xhr = new XMLHttpRequest();
    var isErrorFired = false;
    xhr.open('GET', resource.src, true);
    xhr.send(null);
    xhr.onreadystatechange = function(e) {
      if (xhr.readyState == 4 && (xhr.status >= 200 || xhr.status < 300 || xhr.status == 304)) {
        doDone(xhr.responseText);
      } else if (!isErrorFired && xhr.status === 404) {
        doError(xhr.status);
        isErrorFired = true;
      }
    };
  };

  return RawHandler;
});
