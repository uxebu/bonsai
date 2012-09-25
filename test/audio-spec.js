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

    describe('attr', function() {
      it('Can get and set the volume (0..1)', function() {
        var a = new Audio();
        expect(a.attr('volume')).toBe(1);
        a.attr('volume', .98);
        expect(a.attr('volume')).toBe(.98);
        a.attr('volume', null);
        expect(a.attr('volume')).toBe(.98); // unchanged
        a.attr('volume', -1);
        expect(a.attr('volume')).toBe(0); // nearest acceptable value
        a.attr('volume', 99);
        expect(a.attr('volume')).toBe(1); // nearest acceptable value
      });
    });

    it('Can play()', function() {
      var a = new Audio();
      expect(a.attr('playing')).toBe(false);
      a.play();
      expect(a.attr('playing')).toBe(true);
      expect(a.play()).toBe(a);
    });

    it('Can play(time)', function() {
      var a = new Audio();
      expect(a.attr('playing')).toBe(false);
      expect(a.attr('time')).toBe(0);
      a.play(5.17);
      expect(a.attr('playing')).toBe(true);
      expect(a.attr('time')).toBe(5.17);
    });

    it('Can stop()', function() {
      var a = new Audio();
      expect(a.attr('playing')).toBe(false);
      a.attr('playing', true);
      a.stop();
      expect(a.attr('playing')).toBe(false);
    });

  })
});
