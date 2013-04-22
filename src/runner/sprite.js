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
    this._callback = callback;
    this.sources = sources;
    this.currentBitmapIndex = 0;

    if (callback) {
      // TODO: Do we want such a cross-dependency?
      AssetDisplayObject.prototype.bindAssetCallback.call(this, callback);
    }

    Object.defineProperties(this._attributes, {
      height: data(0, true, true),
      width: data(0, true, true)
    });

    this._load();
  }

  var proto = Sprite.prototype = Object.create(Group.prototype);

  // @private
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

  // @private
  proto._bitmapLoaded = function(bitmap) {

    var callback = this._callback;

    this.addChild(bitmap);

    if (callback && this.displayList.children.length == this.sources.length) {
      this.emit('load', callback);
    }
  };

  return Sprite;
});
