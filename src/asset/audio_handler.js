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

  AudioHandler.prototype = Object.create(AssetHandler.prototype);

  AudioHandler.prototype.loadResource = function(resource, doDone, doError) {

    var audioElement, vendorMimeType, audioSlashMimeType;
    var assetId = this.id,
        loadLevel = this.request.loadLevel || 'canplay',
        mimeType = resource.type,
        canPlayMimeType = domAudio.canPlayType(mimeType),
        src = resource.src;

    // first fallback
    if (!canPlayMimeType) {
      // mime type is unknown, second try. lookup browser's mimetype table
      vendorMimeType = AUDIO_MIME_TYPES[mimeType],
      canPlayMimeType = domAudio.canPlayType(vendorMimeType);
      if (canPlayMimeType) {
        mimeType = vendorMimeType;
      }
    }

    // second fallback
    if (!canPlayMimeType) {
      // mime type is still unknown, third try. add a "audio/" before the type
      audioSlashMimeType = 'audio/' + mimeType;
      canPlayMimeType = domAudio.canPlayType(audioSlashMimeType);
      if (canPlayMimeType) {
        mimeType = audioSlashMimeType;
      }
    }

    if (!canPlayMimeType || this.hasInitiatedLoad) {
      this.resourcesExpectedLength--;
      return;
    }

    this.hasInitiatedLoad = true;

    // Start loading audio
    audioElement = document.createElement('audio');
    audioElement.setAttribute('id', assetId);
    audioElement.setAttribute('type', mimeType);
    audioElement.src = src;
    // Triggers partial content loading (206) and changes the audio to a state
    // where we can make use of "currentTime"
    audioElement.load();
    this.registerElement(audioElement);

    audioElement.addEventListener(events[loadLevel], doDone, false);
  };

  return AudioHandler;
});
