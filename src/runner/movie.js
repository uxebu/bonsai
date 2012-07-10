/**
 * Contains the Movie class.
 *
 * @exports movie
 * @requires module:display_object
 * @requires module:display_list
 * @requires module:timeline
 * @requires module:tools
 */
// a timeline-controlled container.
define([
  './display_object',
  './display_list',
  './timeline',
  '../tools'
], function(DisplayObject, DisplayList, Timeline, tools) {
  'use strict';

  /**
   * The Movie constructor
   *
   * @constructor
   * @param {Stage} root The root object this movie belongs to.
   *
   * @extends module:display_object.DisplayObject
   * @mixes module:timeline.Timeline
   * @mixes module:display_list.DisplayList
   */
  function Movie(root, url, callback) {
    DisplayObject.call(this);

    if (callback) {
      this.on('load', function() {
        callback.call(this, null, this);
      });
      this.on('error', function(errorData) {
        callback.call(this, errorData, this);
      });
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

  var proto = Movie.prototype = tools.mixin(Object.create(DisplayObject.prototype), Timeline, DisplayList);

  proto.loadSubMovie = function() {
    return this.root.loadSubMovie.apply(this.root, arguments);
  };

  /**
   * @see module:display_object.DisplayObject.type
   */
  proto.type = 'Movie';

  return Movie;
});
