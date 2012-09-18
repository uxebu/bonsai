require([
  'bonsai/runner/animation/keyframe_animation',
  'bonsai/runner/timeline',
  'bonsai/tools',
  './runner.js'
], function(KeyframeAnimation, Timeline, tools) {

  var clock = tools.mixin({}, Timeline, {
    framerate: 30,
    isPlaying: false,
    play: function() {
      if (this.isPlaying) {
        return;
      }
      Timeline.play.call(this);
      this.interval = setInterval(
        tools.hitch(this, function() {
          this.emitFrame();
          this.incrementFrame();
        }),
        this.framerate / 1000
      );
    },
    stop: function() {
      Timeline.stop.call(this);
      clearInterval(this.interval);
    }
  });

  clock.play();

  function createKeyframes(duration, frames, options) {
    duration != null || (duration = '1s');
    return new KeyframeAnimation(clock, duration, frames, options);
  }

  describe('KeyframeAnimation', function() {

    it('Will set initial frame\'s props upon play()', function() {

      var subj = {x: 0};
      var k = createKeyframes(0, {
        0: {x: 1},
        1: {x: 2}
      });

      k.addSubjects(subj, 'prop');
      k.play();
      expect(subj.x).toBe(1);
    });

    it('Will animate multiple subjects', function() {
      var subj1 = { id: 1, a: 0 };
      var subj2 = { id: 2, a: 10 };
      var k = createKeyframes(1, {
        0: { a: 0 },
        to: { a: 20 }
      });
      k.addSubjects([subj1, subj2], 'prop');
      k.play();
      expect(subj2.a).toBe(0);
      async(function(nxt) {
        k.on('end', function() {
          expect(subj1.a).toBe(20);
          expect(subj2.a).toBe(20);
          nxt();
        });
      });
    });

    it('Will play transitions in sequence', function() {

      var prevX = 0;
      var subj = {
        x: 0
      };
      var k = createKeyframes('500ms', {
        '0s': {x: 222},
        '0.1s': {x: 676},
        '0.2s': {x: 999},
        '0.5s': {x: 1353}
      });

      k.addSubject(subj, {
        set: function(subject, values) {
          var x = values.x;
          expect(x).toBeGreaterThan(prevX);
          prevX = x;
          subj.x = x;
        },

        get: function(subject, values) {
          return subj;
        }
      });
      k.play();

      async(function(next) {
        k.on('end', next);
      });
    });

    it('supports keyframe N', function() {
      var frame5 = { x: 1234 };
      var k = createKeyframes('330ms', {
        5: frame5
      });
      expect(k.keyframes[5].x).toBe(frame5.x);
    });

    it('supports keyframe N%', function() {
      var frame5 = { x: 1234 };
      var k = createKeyframes('330ms', {
        '50%': frame5
      });
      expect(k.keyframes[5].x).toBe(frame5.x);
    });

    it('supports keyframe Ns', function() {
      var frame5 = { x: 1234 };
      var k = createKeyframes('330ms', {
        '.18s': frame5
      });
      expect(k.keyframes[5].x).toBe(frame5.x);
    });

    it('supports keyframe Nms', function() {
      var frame5 = { x: 1234 };
      var k = createKeyframes('330ms', {
        '180ms': frame5
      });
      expect(k.keyframes[5].x).toBe(frame5.x);
    });
  });
});
