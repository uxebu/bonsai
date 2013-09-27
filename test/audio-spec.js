require([
  'bonsai/runner/audio', 'bonsai/runner/group', 'bonsai/runner/media_display_object',
  './runner.js'
], function(Audio, Group, MediaDisplayObject) {

  var mockLoader;

  describe('Audio', function() {

    beforeEach(function() {
      mockLoader = {
        destroyAsset: jasmine.createSpy('destroyAsset'),
        request: function() {}
      };
    });

    describe('constructor', function() {
      it('inherits from MediaDisplayObject', function() {
        expect(new Audio(mockLoader)).toBeInstanceOf(MediaDisplayObject);
      });
    });

    describe('methods', function() {

      describe('destroy', function() {
        it('will remove the item from stage and call destroyAsset on its loader', function() {
          var d = new Audio(mockLoader, 'abc.mp3', null);
          var parent = new Group();
          parent.addChild(d);
          expect(parent.children()[0]).toBe(d);
          d.destroy();
          expect(mockLoader.destroyAsset).toHaveBeenCalled();
          expect(parent.children()[0]).toBe(void 0);
        });
      });

      describe('clone', function() {
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
});
