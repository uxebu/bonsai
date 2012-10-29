define([
  'bonsai/runner/animation/keyframe_animation',
  'bonsai/runner/timeline',
  'bonsai/tools'
], function(KeyframeAnimation, Timeline, tools) {

  function wrappedSubject(obj) {
    obj.attr = function(a) {
      if (a) {
        for (var i in a) obj[i] = a[i];
      } else {
        return obj;
      }
    };
    return obj;
  }

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

      var subj = wrappedSubject({x: 0});
      var k = createKeyframes(0, {
        0: {x: 1},
        1: {x: 2}
      });

      k.addSubjects(subj);
      k.play();
      expect(subj.x).toBe(1);
    });

    it('Will animate multiple subjects', function() {
      var subj1 = wrappedSubject({ id: 1, a: 0 });
      var subj2 = wrappedSubject({ id: 2, a: 10 });
      var k = createKeyframes(1, {
        0: { a: 0 },
        to: { a: 20 }
      });
      k.addSubjects([subj1, subj2]);
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

    it('Should apply easing', function() {

      var subject = wrappedSubject({ y: 0 });
      var animation = createKeyframes('1s', {
        to: {
          y: -20,
          // static easing function -- always returns .5 (for testing)
          easing: function() { return .5; }
        }
      }, { subjects: subject });
      // Regardless of progress passed, our custom easing function always
      // returns .5, meaning that y should always be half way between 0 and -20
      animation.step(0);
      expect(subject.attr().y).toBe(-10);
      animation.step(1);
      expect(subject.attr().y).toBe(-10);
      animation.step(.8);
      expect(subject.attr().y).toBe(-10);

      var subject = wrappedSubject({ y: 0 });
      var animation = createKeyframes('1s', {
        to: {
          y: 50,
          // custom easing -- always adds .2 to progress:
          easing: function(p) { return p + .2; }
        }
      }, { subjects: subject });
      // Regardless of progress passed, our custom easing function always
      // returns .5, meaning that y should always be half way between 0 and -20
      animation.step(0);
      expect(subject.attr().y).toBe(10);
      animation.step(1);
      expect(subject.attr().y).toBe(60);
      animation.step(.8);
      expect(subject.attr().y).toBe(50);
    });

    it('Should fill in undefined keyframe properties', function() {
      var subject = wrappedSubject({});
      var animation = createKeyframes(1000, {
        0: { a: 0, b: 0, c: 0 },
        500: { a: 20 },
        750: { b: 60 },
        1000: { a: 100, b: 80, c: 60 }
      }).addSubject(subject);
      expect(animation.keyframes[500].a).toBe(20);
      expect(animation.keyframes[500].b).toBe(40);
      expect(animation.keyframes[500].c).toBe(30);
      expect(animation.keyframes[750].a).toBe(60);
      expect(animation.keyframes[750].c).toBe(45);
    });

    it('Will play transitions in sequence', function() {

      var k = createKeyframes('500ms', {
        '0s': {x: 222},
        '0.1s': {x: 676},
        '0.2s': {x: 999},
        '0.5s': {x: 1353}
      });

      var isCalled = false;

      k.addSubject({
        x: 0,
        attr: function(attrs) {
          isCalled = true;
          if (arguments.length === 0) {
            return this;
          } else if (arguments.length === 1) {
            expect(attrs.x).toBeGreaterThan(0);
            this.x = attrs.x;
          }
        }
      });
      k.play();

      async(function(next) {
        k.on('end', function() {
          expect(isCalled).toBe(true);
          next();
        });
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
