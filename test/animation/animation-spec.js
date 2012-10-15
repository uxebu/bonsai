define([
  'bonsai/runner/animation/animation',
  'bonsai/runner/animation/keyframe_animation',
  'bonsai/runner/display_object',
  'bonsai/runner/timeline',
  'bonsai/tools',
  'bonsai/runner/animation/easing',
  'bonsai/runner/path/path',
  'bonsai/color',
  'bonsai/runner/matrix'
], function(Animation, KeyframeAnimation, DisplayObject, Timeline, tools, easing, Path, color, Matrix) {

  function wrappedSubject(obj) {
    return {
      attr: function(a) {
        if (a) {
          for (var i in a) obj[i] = a[i];
        } else {
          return obj;
        }
      }
    };
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

  function createAnimation(duration, properties, options) {
    duration || (duration = '1s');
    properties || (properties = {});
    options || (options = {});
    if (!options.clock) {
      options.clock = clock;
    }
    return new Animation(clock, duration, properties, options);
  }

  describe('Animation', function() {

    describe('constructor', function() {
      it('should not use easing by default', function() {
        var anim = createAnimation();
        expect(anim.easing).toBeUndefined();
      });
      it('should use 0 as default delay', function() {
        var anim = createAnimation();
        expect(anim.delay).toBe(0);
      });
      it('should use apply the duration parameter', function() {
        var anim = createAnimation(1000);
        expect(anim.duration).toBe(1000);
      });
      it('should apply options argument', function() {
        var anim = createAnimation(1, {}, {
          easing: 'quadIn',
          delay: 5
        });
        expect(anim.duration).toBe(1);
        expect(anim.delay).toBe(5);
        expect(anim.easing).toBe(easing['quadIn']);
      });
      it('should register listeners passed in options argument', function() {
        var listener = function(){};
        var anim = createAnimation(null, null, {
          onPlay: listener
        });
        var playListeners = anim.listeners('play');
        expect(playListeners.length).toBe(1);
        expect(playListeners[0].listener).toBe(listener);
      });
    });

    describe('play', function() {
      it('should emit play event', function() {
        var anim = createAnimation();
        anim.addSubject(wrappedSubject({}));
        var listener = jasmine.createSpy('listener');
        anim.on('play', listener);
        anim.play();

        expect(listener).toHaveBeenCalled();
      });
      it('should play', function() {
        var anim = createAnimation();
        anim.addSubject(wrappedSubject({}));
        anim.play();
        expect(anim.isPlaying).toBeTruthy();
      });
    });

    describe('pause', function() {
      it('should emit pause event', function() {
        var anim = createAnimation();
        anim.addSubject(wrappedSubject({}));
        var listener = jasmine.createSpy('listener');
        anim.on('pause', listener);
        anim.play();
        anim.pause();

        expect(listener).toHaveBeenCalled();
      });
      it('should stop', function() {
        var anim = createAnimation();
        anim.addSubject(wrappedSubject({}));
        anim.play();
        anim.pause();
        expect(anim.isPlaying).toBeFalsy();
      });
    });

    describe('event order', function() {
      it('should emit beforebegin before play', function() {
        var anim = createAnimation();
        anim.addSubject(wrappedSubject({}));
        var result = 0;
        anim.on('beforebegin', function(){ result += 1; });
        anim.on('play', function(){ result *= 2; } );
        anim.play();
        expect(result).toBe(2);
      });
    });

    describe('clone', function() {
      it('should return KeyframeAnimation instance', function() {
        var clone = createAnimation().clone();
        expect(clone).toBeInstanceOf(KeyframeAnimation);
      });
      it('should copy endValues to clone', function() {
        var clone = createAnimation(1, ({x:0})).clone();
        expect(clone.keyframes[1].x).toBe(0);
      });
      it('should copy options to clone', function() {
        var clone = createAnimation(100).clone();
        expect(clone.duration).toBe(100);
      });
      it('should not copy listeners to clone', function() {
        var clone = createAnimation(1, null, {onPlay: function(){}}).clone();
        expect(clone.listeners('play')).toEqual([]);
      });
    });

    it('should transform one value to another over time', function() {
      var subject = wrappedSubject({foo:0});
      var anim = new createAnimation('50ms', {
        foo: 1000
      });
      anim.addSubject(subject);
      anim.play();
      async(function(next) {
        anim.on('end', function() {
          expect(subject.attr().foo).toBe(1000);
          next();
        });
      });
    });

    it('should only register onEnd if it\'s a function', function() {
      var fn = function(){};
      var animA = new createAnimation('50ms', ({t:1}), { onEnd: fn });
      var animB = new createAnimation('50ms', ({t:1}), { onEnd: null });
      expect(animA._events[':end'][0].listener).toBe(fn);
      expect(animB._events).toBe(undefined);
    });

    it('should transform one value to another over time after a specified delay', function() {
      var subject = wrappedSubject({foo:0});
      var anim = new createAnimation('50ms', {
        foo: 1000
      }, {
        delay: '60ms'
      });
      expect(anim.delay).toBe(2);
      anim.addSubject(subject, 'prop');
      anim.play();
      async(function(next) {
        anim.on('end', function() {
          expect(subject.attr().foo).toBe(1000);
          next();
        });
      });
    });

    it('should animate multiple properties over time', function() {
      var subject = wrappedSubject({foo:0, bar:0, far:100});
      var anim = createAnimation('50ms', {
        foo: 1000,
        bar: -777,
        far: 0.053
      });
      anim.addSubject(subject, 'prop');
      anim.play();
      async(function(next) {
        anim.on('end', function() {
          expect(subject.attr().foo).toBe(1000);
          expect(subject.attr().bar).toBe(-777);
          expect(subject.attr().far).toBeCloseTo(0.053);
          next();
        });
      });
    });

    it('should animate multiple subjects at once', function() {
      var subjects = [
        wrappedSubject({x: 0, y: 0, id: 1}),
        wrappedSubject({x: 0, y: 50, id: 2}),
        wrappedSubject({x: 0, y: 100, id: 3})
      ];
      var anim = createAnimation('50ms', {
        x: 500
      });
      anim.addSubjects(subjects, 'prop');
      anim.play();
      async(function(next) {
        anim.on('end', function() {
          expect(subjects[0].attr()).toEqual({x: 500, y: 0, id: 1});
          expect(subjects[1].attr()).toEqual({x: 500, y: 50, id: 2});
          expect(subjects[2].attr()).toEqual({x: 500, y: 100, id: 3});
          next();
        });
      });
    });

    it('Should be able to animate a matrix', function() {
      var subject = wrappedSubject({matrix:new Matrix(1,0,0,1,0,0)});
      var anim = new createAnimation('50ms', {
        matrix: new Matrix(2,1,-1,1,150,200)
      });
      anim.addSubjects(subject, 'prop');
      anim.play();
      async(function(next) {
        anim.on('end', function() {
          expect(subject.attr().matrix.a).toBe(2);
          expect(subject.attr().matrix.b).toBe(1);
          expect(subject.attr().matrix.c).toBe(-1);
          expect(subject.attr().matrix.d).toBe(1);
          expect(subject.attr().matrix.tx).toBe(150);
          expect(subject.attr().matrix.ty).toBe(200);
          next();
        });
      });
    });
  });

  describe('Path - morphing', function() {

    function sensibleCopyOfSegments(segments) {
      return segments.map(function(seg){
        return [].slice.call(seg).map(function(arg){
          return isNaN(arg) ? arg : arg.toFixed(5);
        });
      });
    }

    describe('morphTo', function() {

      var source = new Path().moveTo(1, 1).lineTo(100, 50).arcTo(10, 10, 0, 0, 0, 20, 20),
          sourceClone = source.clone(),
          target = new Path().moveTo(20, 20).lineTo(200, 11).arcTo(22, 33, 0, 0, 0, 30, 30);

      source.attr({strokeColor: 'red', opacity: 0.5});
      target.attr({strokeColor: 'blue', opacity: 0.5});

      it('Should morph a source to the target segments', function() {

        async(function(next) {

          source.morphTo(target, '30ms', {
            clock: clock,
            onEnd: function() {
              // Numbers can be slightly different due to unknown issue,
              // set toFixed(5) to toFixed(15) to see
              // (we believe it to be an inconsistent error due to JS' handling of numbers -- a 'wtf')
              expect(
                sensibleCopyOfSegments(source._segments)
              ).toEqual(
                sensibleCopyOfSegments(target._segments)
              );
              expect(+source.attr('strokeColor')).toBe(+color('blue'));
              expect(source.attr('opacity')).toBe(0.5);
              next();
            }
          });

          // Animation should have started. Segments should be different
          // (transferred to curves segments)
          expect(
            sensibleCopyOfSegments(sourceClone._segments)
          ).toNotEqual(
            sensibleCopyOfSegments(source._segments)
          );

        });

      });

    });


  });
});
