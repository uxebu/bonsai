define([
  'bonsai/tools',
  'bonsai/runner/timeline'
], function(tools, Timeline) {

  function makeTimeline(currentFrame) {
    currentFrame = currentFrame || 0;
    return tools.mixin({}, Timeline, {currentFrame: currentFrame});
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
      timeline.emitFrame();
      timeline.emitFrame();

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

    describe('emitFrame', function() {
      testFrameEmission('emitFrame');

      it('should return an array', function() {
        expect(makeTimeline().emitFrame()).toBeArray();
      });

      it('should return the passed-in array', function() {
        var array = [];
        expect(makeTimeline().emitFrame(array)).toBe(array);
      });
    });

    describe('#playFrame()', function() {
      it('should return the instance', function() {
        var timeline = makeTimeline();
        expect(timeline.playFrame()).toBe(timeline);
      });

      testFrameEmission('playFrame');


      it('should increment the current frame of itself after advancing all children', function() {
        var timeline = makeTimeline();
        timeline.length(123);
        var frameAtStart = timeline.currentFrame;
        var frameAtChildAdvance;
        var child = {
          emitFrame: function() { frameAtChildAdvance = timeline.currentFrame; }
        };
        timeline.displayList = { children: [child] };

        timeline.playFrame();
        expect(frameAtChildAdvance).toBe(frameAtStart);
        expect(timeline.currentFrame).toBe(frameAtStart + 1);
      });

      it('should increment all playing child timelines after all advance events, if no parameter is passed', function() {
        function addNext(child, i, children) {
          child.next = children[i + 1];
          return child;
        }

        function group(currentFrame) {
          var group = makeTimeline(currentFrame);
          var children = [].slice.call(arguments, 1);
          children.forEach(addNext);
          group.displayList = {
            children: children
          };
          return group;
        }

        function children(node) {
          return node.displayList && node.displayList.children || [];
        }

        var concat = Array.prototype.concat;
        function flattenTree(node) {
          return concat.apply([node], children(node).map(flattenTree));
        }

        function currentFrames(node) {
          return flattenTree(node).map(function(node) {
            return node.currentFrame;
          });
        }

        function expectedNextFrames(node) {
          return flattenTree(node).map(function(node) {
            return node.currentFrame + (node.isPlaying ? 1 : 0);
          });
        }

        var stoppedChild = makeTimeline(123).stop();
        var stoppedChild2 = group(67,
          makeTimeline(20),
          makeTimeline(21),
          group(2,
            makeTimeline(0)),
          makeTimeline(3))
          .stop();
        var lastChild = makeTimeline();

        var timeline =
          group(2,
            group(0,
              makeTimeline(3)),
            group(5,
              makeTimeline(10),
              group(0,
                stoppedChild,
                makeTimeline(7))),
            makeTimeline(8),
            stoppedChild2,
            lastChild);

        var framesAtStart = currentFrames(timeline);
        var expectedFrames = expectedNextFrames(timeline);
        var framesAtAdvance;

        lastChild.on('advance', function() {
          framesAtAdvance = currentFrames(timeline);
        });
        timeline.playFrame();

        expect(framesAtAdvance).toEqual(framesAtStart);
        expect(currentFrames(timeline)).toEqual(expectedFrames);
      });

      it('should not advance timelines beyond the last frame, but jump back to frame 0', function() {
        var timelineLength = 10;
        timeline
          .length(timelineLength)
          .currentFrame = timelineLength - 1;

        var childTimelineLength = 5;
        var childTimeline = makeTimeline(childTimelineLength - 1)
          .length(childTimelineLength);

        timeline.displayList = {children: [childTimeline]};

        timeline.playFrame();
        expect(timeline.currentFrame).toBe(0);
        expect(childTimeline.currentFrame).toBe(0);
      });
    });
  });

  function testFrameEmission(methodName) {
    var timeline;
    beforeEach(function() {
      timeline = makeTimeline();
    });

    it('should emit a "tick" event with the timeline and the current frame', function() {
      var frameAtStart = timeline.currentFrame;
      var listener = jasmine.createSpy('tick listener');

      timeline.on('tick', listener)[methodName]();

      expect(listener).toHaveBeenCalledWith(timeline, frameAtStart);
    });

    it('should emit the current-frame-number and "advance" events in order, if the timeline is playing', function() {
      timeline.play();
      var frameAtStart = timeline.currentFrame;

      var calls = [];
      timeline
        .on(timeline.currentFrame, function(timeline, frame) {
          calls.push(['frame', timeline, frame]);
        })
        .on('advance', function(timeline, frame) {
          calls.push(['advance', timeline, frame]);
        })
        [methodName]();

      expect(calls).toEqual([
        ['frame', timeline, frameAtStart],
        ['advance', timeline, frameAtStart]
      ]);
    });


    it('should not emit the current-frame-number and "advance" events, if the timeline is not playing', function() {
      timeline.stop();

      var calls = [];
      timeline
        .on(timeline.currentFrame, function(timeline, frame) {
          calls.push(['frame', timeline, frame]);
        })
        .on('advance', function(timeline, frame) {
          calls.push(['advance', timeline, frame]);
        })
        [methodName]();

      expect(calls).toEqual([]);
    });

    it('should call the `emitFrame` method of every child that is a timeline after emitting the advance event', function() {
      var calls = [];
      var child2 = {emitFrame: function() { calls.push(2); }};
      var child1 = {next: child2, emitFrame: function() { calls.push(1); }};
      var child0 = {next: child1, emitFrame: function() { calls.push(0); }};
      timeline.displayList = {
        children: [
          child0,
          {},
          child1,
          child2
        ]
      };

      timeline.on('advance', function() { calls.push('advance'); });
      timeline[methodName]();
      expect(calls).toEqual(['advance', 0, 1, 2]);
    });

    it('should emit an "tickEnd" event after calling the emitFrame() of the last child', function() {
      var lastChildPassed = false;
      var emittedAfterPassingLastChild;
      var currentFrame = timeline.currentFrame;

      timeline.displayList = {
        children: [
          { emitFrame: function() { lastChildPassed = true; } }
        ]
      };

      var onTickEnd = jasmine.createSpy().andCallFake(function() {
        emittedAfterPassingLastChild = lastChildPassed === true;
      });
      timeline
        .on('tickEnd', onTickEnd)
        .emitFrame();

      expect(emittedAfterPassingLastChild).toBe(true);
      expect(onTickEnd).toHaveBeenCalledWith(timeline, currentFrame);

    });
  }
});
