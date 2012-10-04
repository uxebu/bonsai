require([
  'bonsai/runner/media_display_object',
  './runner.js'
], function(MediaDisplayObject) {

  describe('MediaDisplayObject', function() {

    describe('attr', function() {
      it('Can get and set the volume (0..1)', function() {
        var a = new MediaDisplayObject();
        expect(a.attr('volume')).toBe(1);
        a.attr('volume', 0.98);
        expect(a.attr('volume')).toBe(0.98);
        a.attr('volume', null);
        expect(a.attr('volume')).toBe(0.98); // unchanged
        a.attr('volume', -1);
        expect(a.attr('volume')).toBe(0); // nearest acceptable value
        a.attr('volume', 99);
        expect(a.attr('volume')).toBe(1); // nearest acceptable value
      });
    });

    it('Can play()', function() {
      var a = new MediaDisplayObject();
      expect(a.attr('playing')).toBe(false);
      a.play();
      expect(a.attr('playing')).toBe(true);
      expect(a.play()).toBe(a);
    });

    it('play(undefined) does not send `time` to the renderer', function() {
      var a = new MediaDisplayObject();
      a.play(0);
      expect(a.composeRenderMessage().attributes.time).toBe(0);
      a.play();
      expect(a.composeRenderMessage().attributes.time).not.toBeDefined();
    });

    it('Can play(time)', function() {
      var a = new MediaDisplayObject();
      expect(a.attr('playing')).toBe(false);
      expect(a.attr('time')).toBe(0);
      a.play(5.17);
      expect(a.attr('playing')).toBe(true);
      expect(a.attr('time')).toBe(5.17);
    });

    it('Can stop()', function() {
      var a = new MediaDisplayObject();
      expect(a.attr('playing')).toBe(false);
      a.attr('playing', true);
      a.stop();
      expect(a.attr('playing')).toBe(false);
    });

  });

});
