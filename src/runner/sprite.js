define([
  './bitmap',
  './group',
  './asset_display_object',
  '../tools'
], function(Bitmap, Group, AssetDisplayObject, tools) {
  'use strict';

  var data = tools.descriptorData;

  /**
   * Constructs a Sprite instance [ignored since incomplete]
   *
   * @constructor
   * @name Sprite
   * @extends Group
   */
  function Sprite(loader, sources, callback) {

    Group.call(this);

    this._loader = loader;
    this.sources = sources;
    this.currentBitmapIndex = 0;

    if (callback) {
      this.bindAssetCallback(callback);
    }

    Object.defineProperties(this._attributes, {
      height: data(0, true, true),
      width: data(0, true, true)
    });

    this._load();
  }

  var proto = Sprite.prototype = tools.mixin(Object.create(Group.prototype), AssetDisplayObject);

  proto._load = function() {

    var me = this,
        sources = this.sources;

    for (var i = 0, l = sources.length; i < l; ++i) {
      new Bitmap(this._loader, sources[i], function(err, data) {
        if (err) {
          me.emit('error', data);
        } else {
          me._bitmapLoaded(this);
        }
      });
    }
  };

  proto._bitmapLoaded = function(bitmap) {

    this.addChild(bitmap);

    if (this._children.length == this.sources.length) {
      this.emit('load', this._children);
    }
  };

  /**
   * Overriden - Composes a message for the renderer
   *
   * @returns {object} The message
   */
  proto.composeRenderMessage = function(message) {

      message = Group.prototype.composeRenderMessage.call(this, message);
      var bitmap = this._children[this.currentBitmapIndex];

      this._children.forEach(function(child) {
        child.type = 'bitmap_hidden';
      });

      message.attributes = this.attr();
      message.attributes.source = bitmap.attr('source');
      message.attributes.height = bitmap.getComputed('height');
      message.attributes.width = bitmap.getComputed('width');
      message.type = 'Bitmap';
      message.id = bitmap.id;

      return message;
  };

  return Sprite;
});
