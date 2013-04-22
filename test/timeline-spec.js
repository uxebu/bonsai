define([
  'bonsai/tools',
  'bonsai/runner/timeline'
], function(tools, Timeline) {

  function makeTimeline() {
    return tools.mixin({}, Timeline);
  }

  describe('timeline', function() {

    var timeline = makeTimeline();

    it('Starts with a length of zero', function() {
      expect(timeline.length()).toBe(0);
    });

    it('Plays frames in the correct order', function() {

      var calls = 0;

      timeline.frames([
        function(){ calls++; },
        function(){ calls++; },
        function(){ calls++; }
      ]);

      timeline.emitFrame();
      timeline.incrementFrame();
      timeline.emitFrame();
      timeline.incrementFrame();
      timeline.emitFrame();
      timeline.incrementFrame();

      expect(calls).toBe(3);
    });

    it('play() sets isPlaying:true and can update currentFrame (with arg)', function() {

      var calls = 0,
          framerate = 60;

      timeline.framerate = framerate;

      timeline.stop();
      expect(timeline.isPlaying).toBe(false);

      timeline.play(Math.round(framerate * 3.9));
      expect(timeline.isPlaying).toBe(true);
      expect(timeline.currentFrame).toBe(Math.round(framerate * 3.9));
    });

    describe('toFrameNumber', function() {

      var timeline = makeTimeline();
      timeline.framerate = 50;
      timeline.length(1000);

      it('Returns regular frame if input=frame', function() {
        expect(timeline.toFrameNumber(0)).toBe(0);
        expect(timeline.toFrameNumber(50)).toBe(50);
        expect(timeline.toFrameNumber(25)).toBe(25);
        expect(timeline.toFrameNumber(125)).toBe(125);
        expect(timeline.toFrameNumber(1000)).toBe(1000);
      });

      it('Converts seconds to frames', function() {
        expect(timeline.toFrameNumber('0s')).toBe(0);
        expect(timeline.toFrameNumber('1s')).toBe(50);
        expect(timeline.toFrameNumber('0.5s')).toBe(25);
        expect(timeline.toFrameNumber('2.5s')).toBe(125);
        expect(timeline.toFrameNumber('20.0s')).toBe(1000);
      });

      it('Converts milliseconds to frames', function() {
        expect(timeline.toFrameNumber('0ms')).toBe(0);
        expect(timeline.toFrameNumber('1000ms')).toBe(50);
        expect(timeline.toFrameNumber('500ms')).toBe(25);
        expect(timeline.toFrameNumber('2500ms')).toBe(125);
        expect(timeline.toFrameNumber('20000ms')).toBe(1000);
      });

      it('Converts % to frames', function() {
        expect(timeline.toFrameNumber('0%')).toBe(0);
        expect(timeline.toFrameNumber('5%')).toBe(50);
        expect(timeline.toFrameNumber('5%')).toBe(50);
        expect(timeline.toFrameNumber('2.5%')).toBe(25);
        expect(timeline.toFrameNumber('8%')).toBe(80);
        expect(timeline.toFrameNumber('100%')).toBe(1000);
      });

      it('Converts keywords to frames', function() {
        expect(timeline.toFrameNumber('from')).toBe(0);
        expect(timeline.toFrameNumber('start')).toBe(0);
        expect(timeline.toFrameNumber('to')).toBe(1000);
        expect(timeline.toFrameNumber('end')).toBe(1000);
      });

    });

    describe('play', function() {
      it('Sets isPlaying to true', function() {

        var t = makeTimeline();
        t.isPlaying = false;
        t.play();
        expect(t.isPlaying).toBe(true);

      });
      it('Accepts goto frame as argument', function() {

        var t = makeTimeline(),
            calls = 0;

        t.frames({
          0: function(){},
          1: function(){},
          2: function() {
            calls++;
          }
        });

        t.play(2);
        expect(t.currentFrame).toBe(2);
        expect(calls).toBe(1); // frames[2] should only have been called once
        t.emitFrame();           // this call should know to "skip" frames[2]
        expect(calls).toBe(1); // so frames[2] should still only have been called once.

      });
    });

    describe('stop', function() {
      it('Sets isPlaying to false', function() {

        var t = makeTimeline();
        t.isPlaying = true;
        t.stop();
        expect(t.isPlaying).toBe(false);

      });
      it('Accepts goto frame as argument', function() {

        var t = makeTimeline(),
            calls = 0;

        t.frames({
          0: function(){},
          1: function(){},
          2: function() {
            calls++;
          }
        });

        t.stop(2);
        expect(t.currentFrame).toBe(2);
        expect(calls).toBe(1);

      });
    });
  });
});
