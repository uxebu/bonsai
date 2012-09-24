define([
  'bonsai/runner/movie',
  'common/mock',
  'common/displaylist-owner',
  'common/displayobject-lifecycle'
], function(Movie, mock, testDisplayList, testLifeCycle) {

  describe('Movie', function() {

    testDisplayList(function(displayList) {
      return new Movie({}, null, null, displayList);
    });

    it('Sets its root to first argument [usually bound by environment.js]', function() {
      var root = {},
          m = new Movie(root);
      expect(m.root).toBe(root);
    });

    it('Will call root.loadSubMovie if we pass a URL', function() {
      var root = {
        loadSubMovie: jasmine.createSpy('loadSubMovie')
      };
      var url = 'http://abc.def/pa/t/h.js';
      var callback = function() {};
      var m = new Movie(root, url, callback);
      expect(root.loadSubMovie).toHaveBeenCalled();
    });

    testLifeCycle(function() { return new Movie({}); });
    describe('movie lifecycle', function() {
      var movie, registry, stage;
      beforeEach(function() {
        stage = mock.createStage();
        registry = stage.registry;
        movie = new Movie(stage);
        movie.parent = mock.createDisplayObject();
      });
      describe('_activate()', function() {
        it('should add the movie to the movie registry', function() {
          movie._activate(stage);
          expect(registry.movies.add).toHaveBeenCalledWith(movie);
        });
      });
      describe('_deactivate()', function() {
        it('should remove the movie from the movie registry', function() {
          movie._activate(stage);

          movie._deactivate();
          expect(registry.movies.remove).toHaveBeenCalled();
        });
      });
    });

  });

});
