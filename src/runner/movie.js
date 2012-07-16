define([
  './display_object',
  './asset_display_object',
  './display_list',
  './timeline',
  '../tools'
], function(DisplayObject, AssetDisplayObject, DisplayList, Timeline, tools) {
  'use strict';

  /**
   * Constructs a Movie instance
   *
   * @constructor
   * @name Movie
   * @param {String} [url] The URL location of the movie to load.
   * @param {Function} [callback] A callback to be called when your movie has
   *  loaded (only called if you passed a `url`). The callback will be called
   *  with it's first argument signifying an error. So, if the first argument
   *  is `null` you can assume the movie was loaded successfully.
   *
   * @extends DisplayObject
   * @mixes Timeline
   * @mixes DisplayList
   * @mixes AssetDisplayObject
   */
  function Movie(root, url, callback) {
    DisplayObject.call(this);

    if (callback) {
      this.bindAssetCallback(callback);
    }

    this.root = root;
    this._children = [];
    var me = this;
    if (url) {
      root.loadSubMovie(url, function(err) {
        // We trigger the event asynchronously so as to ensure that any events
        // bound after instantiation are still triggered:
        if (err) {
          me.emitAsync('error', err, me);
        } else {
          me.emitAsync('load', me);
        }
      }, this);
    }
  }

  var proto = Movie.prototype = tools.mixin(Object.create(DisplayObject.prototype), Timeline, DisplayList, AssetDisplayObject);

  proto.loadSubMovie = function() {
    return this.root.loadSubMovie.apply(this.root, arguments);
  };

  /**
   * @see DisplayObject.type
   */
  proto.type = 'Movie';

  return Movie;
});
