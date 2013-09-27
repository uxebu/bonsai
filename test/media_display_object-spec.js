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

    describe('methods', function() {

      describe('play', function() {
        it('can play()', function() {
          var a = new MediaDisplayObject();
          expect(a.attr('playing')).toBe(false);
          a.play();
          expect(a.attr('playing')).toBe(true);
          expect(a.play()).toBe(a);
        });
        it('play(time) sends `time` to the renderer', function() {
          var a = new MediaDisplayObject();
          var time = 2; // cannot be 0, that's the initial value
          a.play(time);
          expect(a.composeRenderMessage().attributes.time).toBe(time);
        });
        it('play(undefined) does not send `time` to the renderer', function() {
          var a = new MediaDisplayObject();
          a.play();
          expect(a.composeRenderMessage().attributes.time).not.toBeDefined();
        });
        it('should send `time` to the renderer for `play(0)`', function() {
          var a = new MediaDisplayObject();
          a.attr('time', 2); // needs to be different from 0;

          a.play(0);
          expect(a.composeRenderMessage().attributes.time).toBe(0);
        });
        it('Can play(time)', function() {
          var a = new MediaDisplayObject();
          expect(a.attr('playing')).toBe(false);
          expect(a.attr('time')).toBe(0);
          a.play(5.17);
          expect(a.attr('playing')).toBe(true);
          expect(a.attr('time')).toBe(5.17);
        });
      });

      describe('stop', function() {
        it('Can stop()', function() {
          var a = new MediaDisplayObject();
          expect(a.attr('playing')).toBe(false);
          a.attr('playing', true);
          a.stop();
          expect(a.attr('playing')).toBe(false);
        });
      });

      describe('notify', function() {
        it('returns the current instance', function() {
          var mediaDisplayObject = new MediaDisplayObject();
          expect(mediaDisplayObject.notify()).toBe(mediaDisplayObject);
        });
        it('emits "end" on type=end', function() {
          var mediaDisplayObject = new MediaDisplayObject();
          var endSpy = jasmine.createSpy('end');
          mediaDisplayObject.on('end', endSpy);
          mediaDisplayObject.notify('end');
          expect(endSpy).toHaveBeenCalledWith(mediaDisplayObject);
        });
      });

    });

  });

});
