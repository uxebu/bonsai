/**
 * Type handler for bitmaps
 */
define(['./asset_handler'], function(AssetHandler) {
  'use strict';

  function BitmapHandler() {
    AssetHandler.apply(this, arguments);
  }

  var proto = BitmapHandler.prototype = Object.create(AssetHandler.prototype);

  proto.loadResource = function(resource, doDone, doError) {

    var img = new Image;

    img.onload = function() {
      doDone({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = function() {
      doError('Could not load image');
    };

    img.src = resource.src;

    if (img.complete) {
      img.onload();
    }
  };

  return BitmapHandler;
});
