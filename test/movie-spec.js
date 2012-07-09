require([
  'bonsai/runner/movie',
  './runner.js'
], function(Movie) {
  
  describe('Movie', function(){

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
      var onSuccess = function() {};
      var onError = function() {};
      var m = new Movie(root, url, onSuccess, onError);
      expect(root.loadSubMovie).toHaveBeenCalledWith(url, onSuccess, onError, m);
    });

  });
  
});
