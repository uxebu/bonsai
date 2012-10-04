/**
 * Type handler for videos
 */
define([
  './asset_handler'
], function(AssetHandler) {
  'use strict';

  var VIDEO_MIME_TYPES = AssetHandler.MIME_TYPES.video;

  var domVideo;
  try {
    domVideo = document.createElement('video');
  } catch (e) {}

  var events = {
    'progress': 'progress',
    'loadstart': 'loadstart',
    'loadedmetadata': 'loadedmetadata',
    'loadeddata': 'loadeddata',
    'canplay': 'canplay',
    'canplaythrough': 'canplaythrough'
  };

  function VideoHandler() {
    AssetHandler.apply(this, arguments);
  }

  var getPlayableMimeType = VideoHandler.getPlayableMimeType = function(mimeType) {

    // check environment and make sure `domVideo` is available
    if (!domVideo) {
      return '';
    }

    // 1) user's mimetype
    if (domVideo.canPlayType(mimeType)) {
      return mimeType;
    }

    // 2nd fallback - lookup browser's mimetype table
    var vendorMimeType = VIDEO_MIME_TYPES[mimeType];
    if (vendorMimeType && domVideo.canPlayType(vendorMimeType)) {
      return vendorMimeType;
    }

    // 3rd fallback - prepend "video/"
    var videoSlashMimeType = 'video/' + mimeType;
    if (domVideo.canPlayType(videoSlashMimeType)) {
      return videoSlashMimeType;
    }

    return '';
  };

  VideoHandler.prototype = Object.create(AssetHandler.prototype);

  VideoHandler.prototype.loadResource = function(resource, doDone, doError) {

    var videoElement,
        assetId = this.id,
        loadLevel = this.request.loadLevel || 'canplay',
        mimeType = getPlayableMimeType(resource.type),
        src = resource.src;

    if (!mimeType || this.hasInitiatedLoad) {
      this.resourcesExpectedLength--;
      return;
    }

    this.hasInitiatedLoad = true;

    // start loading video
    videoElement = document.createElement('video');
    videoElement.setAttribute('id', assetId);
    videoElement.setAttribute('type', mimeType);
    videoElement.src = src;

    this.registerElement(videoElement);

    function onload() {
      doDone({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });
    }

    videoElement.addEventListener(events[loadLevel], onload, false);

    videoElement.addEventListener('error', function() {
      doError('Could not load video (' + src + ').');
    }, false);
  };

  return VideoHandler;
});
