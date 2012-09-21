/**
 * Type handler for audio
 */
define([
  './asset_handler'
], function(AssetHandler) {
  'use strict';

  var AUDIO_MIME_TYPES = AssetHandler.MIME_TYPES.audio;

  var domAudio = typeof document !== 'undefined' && document.createElement ?
    document.createElement('audio') : 0;

  var events = {
    'start-with-nothing': 'loadstart',
    'metadata': 'loadedmetadata',
    'risky-to-play': 'loadeddata',
    'can-play': 'canplay',
    'can-play-through': 'canplaythrough'
  };

  function AudioHandler() {
    AssetHandler.apply(this, arguments);
  }

  AudioHandler.prototype = Object.create(AssetHandler.prototype);

  AudioHandler.prototype.loadResource = function(resource, doDone, doError) {

    var audioElement, vendorMimeType;
    var assetId = this.id,
        loadLevel = this.request.loadLevel || 'can-play',
        mimeType = resource.type,
        canPlayMimeType = domAudio.canPlayType(mimeType),
        src = resource.src;

    if (!canPlayMimeType) {
      // mime type is unkown, second try. lookup browser's mimetype table
      vendorMimeType = AUDIO_MIME_TYPES[mimeType],
      canPlayMimeType = domAudio.canPlayType(vendorMimeType);
      mimeType = vendorMimeType;
    }

    if (!canPlayMimeType || this.hasInitiatedLoad) {
      this.resourcesExpectedLength--;
      return;
    }

    this.hasInitiatedLoad = true;

    // start loading audio
    audioElement = document.createElement('audio');
    audioElement.setAttribute('id', assetId);
    audioElement.setAttribute('type', mimeType);
    audioElement.src = src;

    this.registerElement(audioElement);

    function onload() {
      doDone();
    }

    audioElement.addEventListener(events[loadLevel], onload, false);

    audioElement.addEventListener('error', function() {
      doError('Could not load audio.');
    }, false);

    // TODO: These events need to be passed to the worker somehow
    audioElement.addEventListener('ended', function() {
      //console.log('ended');
    }, false);

    audioElement.addEventListener('play', function() {
      //console.log('play');
    }, false);

    audioElement.addEventListener('pause', function() {
      //console.log('paused');
    }, false);
  };

  return AudioHandler;
});
