define([
  '../tools',
  '../asset/asset_request',
  '../event_emitter'
], function(tools, AssetRequest, eventEmitter) {
  'use strict';

  var uid = 0;

  /**
   * Creates a new Font (and initiates loading of it)
   * @constructor
   * @name FontFamily
   * @param {AssetLoader} The asset loader to use
   * @param {String} fontId The ID/name of the font
   * @param {String|Object|Array} resources A single or list of resources, in any
   *  form accepted by AssetRequest
   */
  function FontFamily(loader, fontId, resources) {
    Object.defineProperty(this, 'id', { value: 'font_' + uid++ });
    this._loader = loader;
    this.fontId = fontId;
    this.resources = resources;
    this._load();
  }

  var proto = FontFamily.prototype = Object.create(eventEmitter);

  proto._load = function() {
    var req = new AssetRequest({
      id: this.fontId,
      resources: this.resources
    });
    this._loader.request(this, req, 'Font');
  };

  /**
   * Notify is called by the AssetLoader (this._loader)
   * @private
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
        this.emitAsync('error', Error(data.error), this);
        break;
    }

    return this;
  };

  return FontFamily;
});
