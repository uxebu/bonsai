require([
  'bonsai/runner/audio',
  'bonsai/runner/group',
  './runner.js'
], function(Audio, Group) {

  var mockLoader;

  describe('Audio', function() {

    beforeEach(function() {
      mockLoader = {
        destroyAsset: jasmine.createSpy('destroyAsset'),
        request: function() {}
      };
    });

    it('Provides destroy method which will remove the item from stage and call destroyAsset on its loader', function() {
      var d = new Audio(mockLoader, 'abc.mp3', null);
      var parent = new Group();
      parent.addChild(d);
      expect(parent.children()[0]).toBe(d);
      d.destroy();
      expect(mockLoader.destroyAsset).toHaveBeenCalled();
      expect(parent.children()[0]).toBe(void 0);
    });

    describe('has a clone method', function() {
      it('returns an Audio instance', function() {
        var d = new Audio(mockLoader, 'abc.mp4', null);
        expect(d.clone() instanceof Audio).toBeTruthy();
      });
      it('returns a fresh/new Audio instance', function() {
        var d = new Audio(mockLoader, 'abc.mp4', null);
        expect(d.clone() !== d).toBeTruthy();
      });
      it('returns a clone with the same source', function() {
        var d = new Audio(mockLoader, 'abc.mp4', null);
        var dc = d.clone();
        expect(d.attr('source') === dc.attr('source')).toBeTruthy();
      });
    });

  });
});
