require([
  'bonsai/runner/movie',
  'common/displaylist-owner',
  'common/displayobject-lifecycle',
  './runner.js'
], function(Movie, testDisplayList, testLifeCycle) {

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
  });

});
