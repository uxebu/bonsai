/**
 * Type handler for audio
 */
define([
  './asset_handler'
], function(AssetHandler) {
  'use strict';

  var AUDIO_MIME_TYPES = AssetHandler.MIME_TYPES.audio;

  var domAudio;
  try { 
    domAudio = document.createElement('audio');
  } catch (e) {}

  var events = {
    'progress': 'progress',
    'loadstart': 'loadstart',
    'loadedmetadata': 'loadedmetadata',
    'loadeddata': 'loadeddata',
    'canplay': 'canplay',
    'canplaythrough': 'canplaythrough'
  };

  function AudioHandler() {
    AssetHandler.apply(this, arguments);
  }

  var playableMimeType = AudioHandler.playableMimeType = function(mimeType) {

    // check environment and make sure `domAudio` is available
    if (!domAudio) {
      return '';
    }

    // 1) user's mimetype
    if (domAudio.canPlayType(mimeType)) {
      return mimeType;
    }

    // 2nd fallback - lookup browser's mimetype table
    var vendorMimeType = AUDIO_MIME_TYPES[mimeType];
    if (vendorMimeType && domAudio.canPlayType(vendorMimeType)) {
      return vendorMimeType;
    }

    // 3rd fallback - prepend "audio/"
    var audioSlashMimeType = 'audio/' + mimeType;
    if (domAudio.canPlayType(audioSlashMimeType)) {
      return audioSlashMimeType;
    }

    return '';
  };

  AudioHandler.prototype = Object.create(AssetHandler.prototype);

  AudioHandler.prototype.loadResource = function(resource, doDone, doError) {

    var audioElement;
    var assetId = this.id,
        loadLevel = this.request.loadLevel || 'canplay',
        mimeType = playableMimeType(resource.type),
        src = resource.src;

    if (!mimeType || this.hasInitiatedLoad) {
      this.resourcesExpectedLength--;
      return;
    }

    this.hasInitiatedLoad = true;

    // Start loading audio
    audioElement = document.createElement('audio');
    audioElement.setAttribute('id', assetId);
    audioElement.setAttribute('type', mimeType);
    audioElement.src = src;
    // Triggers partial content loading (206)
    audioElement.load();
    this.registerElement(audioElement);

    audioElement.addEventListener(events[loadLevel], doDone, false);
  };

  return AudioHandler;
});
