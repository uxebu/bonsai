define([
  './asset_display_object',
  './display_list',
  './timeline',
  '../tools'
], function(AssetDisplayObject, DisplayList, Timeline, tools) {
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
   * @extends AssetDisplayObject
   * @mixes Timeline
   * @mixes DisplayList
   */
  function Movie(root, url, callback) {
    AssetDisplayObject.call(this, null, url, callback);

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

  var proto = Movie.prototype = tools.mixin(Object.create(AssetDisplayObject.prototype), Timeline, DisplayList);

  proto.loadSubMovie = function() {
    return this.root.loadSubMovie.apply(this.root, arguments);
  };

  /**
   * @see DisplayObject.type
   */
  proto.type = 'Movie';

  return Movie;
});
