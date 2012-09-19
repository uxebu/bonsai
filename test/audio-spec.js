require([
  'bonsai/runner/audio',
  'bonsai/runner/group',
  './runner.js'
], function(Audio, Group) {
  describe('Audio', function() {

    it('Provides destroy method which will remove the item from stage and call destroyAsset on its loader', function() {
      var loader = {
        destroyAsset: jasmine.createSpy('destroyAsset'),
        request: function() {}
      };
      var d = new Audio(loader, 'abc.mp3', null);
      var parent = new Group();
      parent.addChild(d);
      expect(parent.children()[0]).toBe(d);
      d.destroy();
      expect(loader.destroyAsset).toHaveBeenCalled();
      expect(parent.children()[0]).toBe(void 0);
    });

  })
});
