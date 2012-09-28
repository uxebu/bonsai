define([
  './asset_display_object',
  '../tools'
], function(AssetDisplayObject, tools) {
  'use strict';

  var data = tools.descriptorData;
  var accessor = tools.descriptorAccessor;
  var getter = tools.getter;

  /** Getters & Setters */
  function getTime() {
    return this._time;
  }
  function setTime(time) {
    time = +time;
    if (typeof time === 'number' && !isNaN(time) && isFinite(time)) {
      this._time = time;
    }
  }

  function getVolume() {
    return this._volume;
  }
  function setVolume(volume) {
    if (volume != null) {
      volume = +volume;
      volume = Math.min( Math.max(volume, 0), 1 ); // between 0 and 1 inclusive
      this._volume = volume;
    }
  }

  /**
   * The Audio constructor
   *
   * @constructor
   * @name Audio
   * @extends AssetDisplayObject
   *
   * @param {String|Array} aRequest The request needs to accomplish the requirements of AssetRequest
   * @param {Function} [callback] A callback to be called when your movie has
   *  loaded (only called if you passed a `aRequest`). The callback will be called
   *  with it's first argument signifying an error. So, if the first argument
   *  is `null` you can assume the movie was loaded successfully.
   *
   * @property {__list__} __supportedAttributes__ List of supported attribute names.
   *    In addition to the property names listed for DisplayObject,
   *    these are the attribute names you can pass to the attr() method. Note
   *    that this property is not available in your code, it's just here for
   *    documentation purposes.
   * @property {string} __supportedAttributes__.source The source of the audio.
   * @property {string} __supportedAttributes__.volume The volume of the audio
   *  (between 0 and 1 inclusive)
   *
   */
  function Audio(loader, aRequest, callback, options) {
    options || (options = {});

    AssetDisplayObject.call(this, loader, aRequest, callback);

    this.type = 'Audio';

    Object.defineProperties(this._attributes, {
      playing: data(!!options.autoplay, true, true),
      prepareUserEvent: data(false, true, true),
      volume: accessor(getVolume, setVolume, true),
      _volume: data(1, true, true),
      time: accessor(getTime, setTime, true),
      _time: data(0, true, true)
    });

    var rendererAttributes = this._renderAttributes;
    rendererAttributes.playing = 'playing';
    rendererAttributes.volume = '_volume';
    rendererAttributes.time = '_time';
    rendererAttributes.prepareUserEvent = 'prepareUserEvent';

    this.request(aRequest);
  }

  var parentPrototype = AssetDisplayObject.prototype;
  var parentPrototypeDestroy = parentPrototype.destroy;

  /** @lends Audio.prototype */
  var proto = Audio.prototype = Object.create(parentPrototype);

  /**
   * Clones the method
   *
   * @returns {Audio} Cloned instance
   */
  proto.clone = function() {
    // options are missing
    return new Audio(this._loader, this._request);
  };

  /**
   * Destroys the DisplayObject and removes any references to the
   * asset, including data held by the renderer's assetController about the
   * source of the audio
   *
   * @returns {this}
   */
  proto.destroy = function() {
    parentPrototypeDestroy.call(this);
    this._loader.destroyAsset(this);
    return this;
  };

  /**
   * Notify the audio that the corresponding data has been loaded. To be used
   * by the asset loader.
   *
   * @private
   * @param {string} type Either 'load' or 'error'
   * @param data
   */
  proto.notify = function(type, data) {

    switch (type) {
      case 'load':
        // We trigger the event asynchronously so as to ensure that any events
        // bound after instantiation are still triggered:
        this.emitAsync('load', this);
        break;
      case 'error':
        // We trigger the event asynchronously so as to ensure that any events
        // bound after instantiation are still triggered:
        this.emitAsync('error', Error(data.error));
    }

    return this;
  };

  /**
   * Play the audio
   * @param {Number} [time] Time to seek playhead to (in seconds)
   *
   * @returns {Audio} this
   */
  proto.play = function(time) {
    return this.attr({
      playing: true,
      time: time
    });
  };

  /** 
   * Prepare the Audio object for a user-event. 
   * (currently this is for iOS devices, see drawAudio method in svg.js)
   *
   * @returns {Audio} this
   */
  proto.prepareUserEvent = function() {
    return this.attr('prepareUserEvent', true);
  };

  /**
   * Pause the audio
   *
   * @returns {Audio} this
   */
  proto.pause = function() {
    return this.attr('playing', false);
  };

  /**
   * Stop/pause the audio
   *
   * @returns {Audio} this
   */
  proto.stop = function() {
    return this.attr({
      playing: false,
      time: 0
    });
  };

  proto.getComputed = function(key) {};

  return Audio;
});
