define([
  './easing',
  '../../tools',
  '../../event_emitter',
  './properties_tween'
], function(easing, tools, EventEmitter, PropertiesTween) {
  'use strict';

  var hasOwn = {}.hasOwnProperty,
      forEach = tools.forEach;

  function getEasingFunction(easingFunc) {
    return typeof easingFunc == 'function' ?
      easingFunc : easing[easingFunc]
  }

  /**
   * Creates a KeyframeAnimation instance
   *
   * @constructor
   * @name KeyframeAnimation
   * @memberOf module:animation
   * @param {number|string} duration The duration, either as frames (number)
   *  or as seconds (e.g. '1s')
   * @param {Object} [properties] The keyframes to animate through
   * @param {Object} [options] Additional options
   * @param {String|Function} [options.easing] Easing function for each sub-animation
   *  @param {Array|Object} [options.subjects] The subject(s) (e.g. DisplayObjects) of
   *    the keyframe-animation
   *  @param {Number|String} [options.delay=0] Delay before animation begins, in
   *   frames or seconds
   * @returns {KeyframeAnimation} An KeyframeAnimation instance
   *
   * @mixes EventEmitter
   */
  function KeyframeAnimation(clock, duration, keyframes, options) {
    options || (options = {});

    this.clock = clock;
    duration = this.duration = +duration || clock.toFrameNumber(duration);

    this._parseEventProps(options);

    this.subjects = [];
    this.initialValues = null;

    this.repeat = (options.repeat || 0) - (options.repeat % 1 || 0);
    this.delay = options.delay && clock.toFrameNumber(options.delay) || 0;
    this.isTimelineBound = options.isTimelineBound !== false;

    var easingFunc = options.easing;
    this.easing = getEasingFunction(easingFunc);

    this.prevFrame = 0;
    this.frame = 0;
    this.currentDelay = this.delay;
    this.currentTweenIndex = 0;

    this.keyframes = this._convertKeysToFrames(keyframes);
    // Get numerical keys (frame-numbers) and sort
    this.keys = Object.keys(this.keyframes).map(Number);
    this.keys.sort(function(a, b){ return a - b; });

    if (options.subjects) {
      this.addSubjects(options.subjects);
    }
  }


  KeyframeAnimation.prototype = /** @lends module:animation.KeyframeAnimation.prototype */ {

    /**
     * Parses and connects event listeners
     * passed via the options object.
     *
     * @private
     */
    _parseEventProps: function(options) {
      var propName, evtName;
      for (propName in options) {
        if (typeof options[propName] === 'function' && propName.indexOf('on') === 0) {
          evtName = propName.slice(2).toLowerCase();
          this.on(evtName, options[propName]);
          delete options[propName];
        }
      }
    },

    /**
     * Clones the KeyframeAnimation instance.
     *
     * @returns {Animation} The clone
     */
    clone: function() {
      return new KeyframeAnimation(this.clock, this.duration, tools.mixin({}, this.keyframes), {
        clock: this.clock,
        duration: this.duration,
        easing: this.easing,
        isTimelineBound: this.isTimelineBound
      });
    },

    /**
     * Starts or resumes an animation
     *
     * Optionally changes the subjects of the animation.
     *
     * @param {Object} [subjects]
     */
    play: function(subjects) {

      if (subjects) {
        this.addSubjects(subjects);
      }

      if (!this.subjects.length) {
        throw Error('No subjects defined -- animation cannot play');
      }

      if (this.isPlaying) {
        return this;
      }

      if (this.frame === 0) {
        this.emit('beforebegin', this);
      }

      this.emit('play', this);

      /*
        Handle the case where initial values are specified and are
        different from the subject's values. We need to set these
        `from` properties manually: (FRAME 0)
      */
      var initial = this.keyframes[0];
      if (initial && this.currentTweenIndex === 0) {
        forEach(this.subjects, function(subj) {
          subj.subject.attr(initial);
        });
      }

      this.isPlaying = true;
      this.clock.on(this.isTimelineBound ? 'advance' : 'tick', this, this._onStep);

      return this;
    },

    /**
     * Pauses an animation
     */
    pause: function() {
      this.clock.removeListener(this.isTimelineBound ? 'advance' : 'tick', this, this._onStep);
      this.emit('pause', this);
      this.isPlaying = false;
      return this;
    },

    /**
     * Resets a keyframe animation (so it's ready to begin again)
     */
    reset: function() {
      this.frame = 0;
      this.isPlaying = false;
      this.currentTweenIndex = 0;
      this.clock.removeListener(this.isTimelineBound ? 'advance' : 'tick', this, this._onStep);
      return this;
    },

    /**
     * Event listener for the clock's tick event, delegates to step()
     * @private
     */
    _onStep: function(_, frameNumber, timelineIsFinished) {

      if (this.currentDelay > 0 && this.currentDelay--) {
        return;
      }

      // lastFrame defaults to the current frame
      // (this'll be at the start of an animation)
      this.prevFrame = this.prevFrame || frameNumber;

      var duration = this.duration,
          frame = this.frame = this.isTimelineBound ? (
            // Increment by how many missing frames there were
            this.frame + ((frameNumber - this.prevFrame) || 1)
          ) : this.frame + 1;

      this.step(frame / duration);

      if (
        (this.isTimelineBound && timelineIsFinished) ||
        frame === duration
      ) {
        this.prevFrame = 0;
        this.currentDelay = this.delay;
        this.reset();
        if (this.repeat-- > 0) {
          this.play();
        } else {
          this.emit('end', this);
        }
        return;
      }

      this.prevFrame = frameNumber;
    },

    /**
     * Runs a single step of the keyframe-animation, setting changed values
     * on their respective subjects
     * @private
     */
    step: function(progress) {

      var realProgress = progress;

      if (this.easing) {
        progress = this.easing(progress);
      }

      var tweensLength = this.subjects[0].tweens.length;
      var curTween = this.subjects[0].tweens[this.currentTweenIndex];
      var phaseProgress = (progress - curTween.startProgress) / (curTween.endProgress-curTween.startProgress);

      // If there's another tween that we can move onto, we should, otherwise
      // assume that we can continue with progress > 1
      if (phaseProgress > 1 && this.currentTweenIndex + 1 < tweensLength) {
        this.currentTweenIndex += 1;
        return this.step(realProgress);
      }

      var subjects = this.subjects;
      for (var s = 0, sl = subjects.length; s < sl; ++s) {
        var currentSubjectTween = subjects[s].tweens[this.currentTweenIndex],
            currentSubjectTweenEasing = currentSubjectTween.easing;
        subjects[s].subject.attr(
          currentSubjectTween.at(
            // Apply easing for this tween:
            currentSubjectTweenEasing ?
              currentSubjectTweenEasing(phaseProgress) :
              phaseProgress
          )
        );
      }
    },

    /**
     * Adds a subject to the keyframe-animation
     * @param {Object} subject The subject (usually a DisplayObject)
     */
    addSubject: function(subject) {

      var initialAttributes = tools.mixin(subject.attr(), this.keyframes[0]);

      if (!this.subjects.length) { // Not yet added subjects?
        this._fillInProperties(initialAttributes);
      }

      this.subjects.push({
        subject: subject,
        tweens: this._createTweens(initialAttributes)
      });

      return this;
    },

    /**
     * Adds multiple subjects to the animation
     * @param {Array} subjects Array of subjects to add
     */
    addSubjects: function(subjects) {
      var me = this;
      subjects = tools.isArray(subjects) ? subjects : [subjects];
      forEach(subjects, function(subject) {
        me.addSubject(subject);
      });
      return this;
    },

    /**
     * Removes a subject from the animation
     * @param {Object} subject The subject to remove
     */
    removeSubject: function(subject) {
      for (var i = 0, l = this.subjects.length; i < l; ++i) {
        if (this.subjects[i].subject === subject) {
          this.subjects.splice(i, 1);
          for (var a = 0, al = this.animations.length; a < al; ++a) {
            this.animations[a].removeSubject(subject);
          }
        }
      }
    },

    /**
     * Removes a subject from the animation
     * @param {Array} subjects Array of subjects to remove
     */
    removeSubjects: function(subjects) {
      forEach(subjects, tools.hitch(this, 'removeSubject'));
      return this;
    },

    /**
     * Creates a PropertiesTween object for each phase of the keyframe animation
     *
     * @private
     */
    _createTweens: function(startValues) {

      var animationDuration,
          totalDuration = 0,
          prevAnimation,
          tweens = [],
          keyframes = this.keyframes,
          prevValues = startValues;

      forEach(this.keys, function(key, i) {

        if (key === 0) { return; } // Don't animate to initial

        var tween, easingFunc = keyframes[key].easing;

        tween = new PropertiesTween(
          prevValues,
          keyframes[key]
        );

        // Save easing function to tween so it can be retrieved on each step:
        tween.easing = getEasingFunction(easingFunc);

        // Calculate duration of this individual tween:
        animationDuration = key - totalDuration;

        tween.startProgress = totalDuration / this.duration;
        tween.endProgress = tween.startProgress + animationDuration / this.duration;

        totalDuration += animationDuration;

        prevValues = keyframes[key];

        tweens.push(tween);

      }, this);

      return tweens;
    },

    /**
     * Fills in properties where they are specified in one
     * keyframe but not in another
     *
     * @private
     */
    _fillInProperties: function(initialValues) {

      var easingFn = this.easingFn,
          lastFrame = this.duration,
          keys = this.keys,
          keyframes = this.keyframes,
          keyframe,
          properties = {};

      // Gather property names:
      forEach(keys, function(key) {

        keyframe = keyframes[key];

        for (var p in keyframe) {
          if (hasOwn.call(keyframe, p)) {
            properties[p] = true;
          }
        }
      });

      // Fill in (missing) properties:
      forEach(keys, function(frame, i) {

        var progress,
            prevFrame,
            nextFrame,
            prevValue,
            nextValue,
            fromValues,
            toValues;

        keyframe = keyframes[frame];

        for (var p in properties) {
          // Is the keyframe does not have a property of the name `p`
          // then we must define it:
          if (!hasOwn.call(keyframe, p)) {

            if (p === 'easing') {
              // Ignore 'easing' keyword -- it's used to define per-tween easing
              continue;
            }

            prevFrame = getFrameOfLastDefinedProperty(p, i);
            nextFrame = getFrameOfNextDefinedProperty(p, i);
            prevValue = prevFrame && keyframes[prevFrame][p] || initialValues[p];
            nextValue = nextFrame && keyframes[nextFrame][p];

            if (prevValue == null) {
              // TODO: throw this only when the 0th frame does not specify props
              // Ideally, though, initialValues will have the value specified
              throw Error('No initial value specified for property: ' + p);
            }

            if (nextValue == null) {
              /*
                If there is no next value then the prevValue
                must be the last occurance and thus the end-point
              */
              nextValue = prevValue;
              nextFrame = lastFrame;
            }

            fromValues = {};
            fromValues[p] = prevValue;
            toValues = {};
            toValues[p] = nextValue;

            // Calculate would-be progress of keyframe:
            progress = (frame - prevFrame) / (nextFrame - prevFrame);

            if (easingFn) {
              progress = easingFn(progress);
            }

            if (nextFrame.easing) {
              progress = getEasingFunction(nextFrame.easing)(progress);
            }

            // Get intermediary value by creating a new PropertiesTween and
            // grabbing the value of the property at the would-be progress:
            keyframe[p] = new PropertiesTween(fromValues, toValues).at(
              progress
            )[p];
          }
        }
      }, this);

      function getFrameOfLastDefinedProperty(prop, keysIndex) {
        // Find last occurance of property within keyframes
        while (keysIndex--) {
          if (hasOwn.call(keyframes[keys[keysIndex]], prop)) {
            return keys[keysIndex];
          }
        }
        return null;
      }

      function getFrameOfNextDefinedProperty(prop, keysIndex) {
        // Find next occurance of property within keyframes
        for (var l = keys.length; keysIndex < l; ++keysIndex) {
          if (hasOwn.call(keyframes[keys[keysIndex]], prop)) {
            return keys[keysIndex];
          }
        }
        return null;
      }
    },

    /**
     * Process keyframes object so that each key of the object is
     * an absolute frame. Make fresh copies using `tools.mixin({},...)`
     *
     * @private
     */
    _convertKeysToFrames: function(keyframes) {
      var key, frame, maxFrame = 0;

      var clock = this.clock;
      var duration = this.duration;
      var keys = Object.keys(keyframes);
      var keyframesClean = Object.create(null);

      for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        frame =
          key == +key ? key : // numerical comparision: frame number
          /^(?:from|start)$/.test(key) ? 0 : // 'from' keyword --> 0
          /^(?:to|end)$/.test(key) ? duration :
          /^\d+%$/.test(key) ? duration * parseFloat(key) / 100 :
          clock.toFrameNumber(key); // everything else
        keyframesClean[frame] = keyframes[key];
        if (frame > maxFrame) {
          maxFrame = frame;
        }
      }

      /*
        If the frame is bigger than the duration then we must
        adjust `duration` to cater for it:
      */
      if (maxFrame > this.duration) {
        this.duration = maxFrame;
      }

      return keyframesClean;
    }
  };

  tools.mixin(KeyframeAnimation.prototype, EventEmitter);

  return KeyframeAnimation;
});
