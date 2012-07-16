/**
 * Contains the registry constructor
 * @exports registry
 */
define(function() {
  'use strict';

  function MovieRegistry() {
    var movies = this.movies = [];

    this.add = function(movie) {
      if (movies.indexOf(movie) === -1) {
        movies.push(movie);
      }
    };
    this.remove = function(movie) {
      var index = movies.indexOf(movie);
      delete movies[index];
    };
  }

  /**
   * @constructor
   * @private
   */
  function Registry() {
    return {
      /**
       * Registry for all DisplayObjects within a bonsai movie.
       *
       * This map serves as an id->class references cache to enable fast lookups
       * in case of events, e.g. that need to be delegated to the according
       * DisplayObject instance.
       *
       * @private
       * @type {object}
       */
      displayObjects: Object.create(null),

      /**
       * Registry for loading DisplayObjects within a bonsai movie.
       *
       * This map serves as an id->instance references cache to enable fast lookups
       * in case of asset-loading events. Only DisplayObjects waiting for items to
       * load will be found in this map.
       *
       * @private
       * @type {object}
       */
      loadingDisplayObjects: Object.create(null),

      /**
       * Registry for Movie instances (sub-movies) within a bonsai movie.
       *
       * This map is used to advance every (currently playing) timeline when a
       * frame is entered.
       *
       * @private
       * @type {object}
       */
      movies: new MovieRegistry(),

      /**
       * Global Registry for display objects that need to be updated by renderer
       *
       * @private
       * @type {object}
       */
      needsDraw: Object.create(null),

      /**
       * Registry for objects that have been inserted or moved.
       *
       * @private
       * @type {Object}
       */
      needsInsertion: Object.create(null),

      /**
       * Registry for pending assets (added/removed via AssetLoader)
       *
       * @private
       * @type {Object}
       */
      pendingAssets: Object.create(null)
    };
  }

  return Registry;
});
