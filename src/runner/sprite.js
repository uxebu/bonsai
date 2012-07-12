define([
  './bitmap',
  './group',
  '../tools'
], function(Bitmap, Group, tools) {
  'use strict';

  var data = tools.descriptorData;

  /**
   * The Sprite constructor
   *
   * @constructor
   * @name Sprite
   * @extends Group
   */
  function Sprite(loader, sources, options) {

    Group.call(this);

    this._loader = loader;
    this.options = options;
    this.sources = sources;
    this.currentBitmapIndex = 0;

    if (options.onload) {
      this.on('load', options.onload);
    }
    if (options.onerror) {
      // TODO: choose diff evt name to avoid special 'error' treatment in eventemitter
      this.on('error', options.onerror);
    }

    Object.defineProperties(this._attributes, {
      height: data(0, true, true),
      width: data(0, true, true)
    });

    this._load();
  }

  var proto = Sprite.prototype = Object.create(Group.prototype);

  proto._load = function() {

    var sources = this.sources;

    for (var i = 0, l = sources.length; i < l; ++i) {
      new Bitmap(this._loader, sources[i], {
        onload: tools.hitch(this, '_bitmapLoaded')
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
      message.attributes.height = bitmap.attr('height');
      message.attributes.width = bitmap.attr('width');
      message.type = 'Bitmap';
      message.id = bitmap.id;

      return message;
  };

  return Sprite;
});
