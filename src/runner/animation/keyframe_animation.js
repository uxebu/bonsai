define([
  './easing',
  '../../tools',
  '../../event_emitter',
  './properties_tween'
], function(easingFunctions, tools, EventEmitter, PropertiesTween) {
  'use strict';

  var hasOwn = {}.hasOwnProperty,
      forEach = tools.forEach;

  /**
   * If func is a string, return the actual function that
   * represents the given easing function name.
   *
   * @private
   * @param {Function|string} easingFunc
   * @return {*}
   */
  function getEasingFunction(easingFunc) {
    return typeof easingFunc == 'function' ?
      easingFunc : easingFunctions[easingFunc]
  }

  /**
   * A KeyframeAnimation is an animation where you can specify expected states
   * at arbitrary keyframes in the animation timeline.
   *
   * @name KeyframeAnimation
   * @constructor
   * @mixes EventEmitter
   * @memberOf module:animation
   *
   * @param {EventEmitter} clock An object that emits a 'tick' event and
   *    has a `toFrameNumber` method.
   * @param {number|string} duration The duration, either as frames (number)
   *    or as seconds (e.g. '1s', '1ms')
   * @param {Object} [keyframes] The keyframes to animate through
   * @param {Object} [options={}] Additional options
   * @property {String|Function} [options.easing] Easing function for each sub-animation
   * @property {Array|Object} [options.subjects] The subject(s) (e.g. DisplayObjects) of
   *    the keyframe-animation
   * @property {Number|String} [options.delay=0] Delay before animation begins, in
   *    frames or seconds
   */
  function KeyframeAnimation(clock, duration, keyframes, options) {
    if (!options) options = {};

    this.clock = clock;
    duration = this.duration = +duration || clock.toFrameNumber(duration);

    this._parseEventProps(options);

    this.subjects = [];

    // Looks wonky, but because repeat allows Infinity, combining it into
    // `(repeat-(repeat%1))||0` would result in 0, rather than Infinity.
    this.repeat = (options.repeat || 0) - (options.repeat % 1 || 0);

    this.delay = (options.delay && clock.toFrameNumber(options.delay)) || 0;
    this.isTimelineBound = options.isTimelineBound !== false;

    this.easing = getEasingFunction(options.easing);

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
     * @private
     * @property {number} clock Frame interval in milliseconds
     */
    clock: null,

    /**
     * @private
     * @property {number} currentDelay Number of frames we are _still_ waiting before starting animation
     */
    currentDelay: -1,
    /**
     * @private
     * @property {number} currentTweenIndex Basically the animation progress
     */
    currentTweenIndex: -1,
    /**
     * @private
     * @property {number} delay Initial number of frames to wait for this animation to begin
     */
    delay: -1,
    /**
     * @private
     * @property {number} duration Number of entire animation in frames
     */
    duration: -1,
    /**
     * @private
     * @property {Function} easing The easing function which transforms the actual progress
     */
    easing: null,
    /**
     * @private
     * @property {number} frame Current frame position (=> relates to progress of animation)
     */
    frame: -1,
    /**
     * @private
     * @property {boolean} isPlaying Is this animation currently applying changes?
     */
    isPlaying: false,
    /**
     * @private
     * @property {boolean} isTimelineBound Does this animation sync progress with the timeline? So
     *    listen to 'tick' or 'advance'?
     */
    isTimelineBound: false,
    /**
     * @private
     * @property {number} keys Explicitly defined key frames (normalized progress) for this animation
     */
    keys: null,
    /**
     * @private
     * @property {Object} keyframes Each key is the proper animation progress for its (key)frame value
     */
    keyframes: null,
    /**
     * @private
     * @property {number} prevFrame Frame number of the first frame of the animation (TOFIX: rename it!)
     */
    prevFrame: -1,
    /**
     * @property {number} repeat Number of times this animation should repeat. Use Infinity for infinite loop.
     */
    repeat: -1,
    /**
     * @private
     * @property {Object[]} subjects The objects that are animated (usually display objects)
     */
    subjects: null,

    /**
     * Parses and connects event listeners
     * passed via the options object.
     *
     * @private
     * @param {Object} options
     * @return {KeyframeAnimation}
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
     * @return {KeyframeAnimation} The clone
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
     * Starts or resumes an animation.
     * Optionally changes the subjects of the animation.
     * Does nothing (except optionally update subjects) if already playing.
     *
     * @param {Object} [subjects]
     * @return {KeyframeAnimation}
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

      // Handle the case where initial values are specified and are
      // different from the subject's values. We need to set these
      // `from` properties manually: (FRAME 0)
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
     *
     * @return {KeyframeAnimation}
     */
    pause: function() {
      this.clock.removeListener(this.isTimelineBound ? 'advance' : 'tick', this, this._onStep);
      this.emit('pause', this);
      this.isPlaying = false;
      return this;
    },

    /**
     * Resets a keyframe animation (so it's ready to begin again)
     *
     * @return {KeyframeAnimation}
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
     *
     * @private
     *
     * @param _ Unused (event param)
     * @param {number} frameNumber
     * @param {boolean} timelineIsFinished
     */
    _onStep: function(_, frameNumber, timelineIsFinished) {

      if (this.currentDelay > 0 && this.currentDelay--) {
        return;
      }

      // prevFrame defaults to the current frame
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
     *
     * @private
     * @param {number} progress
     * @return {undefined}
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
     *
     * @param {Object} subject The subject (usually a DisplayObject)
     * @return {KeyframeAnimation}
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
     *
     * @param {Object|Object[]} subjects Array of subjects or single subject to add (usually display object(s))
     * @return {KeyframeAnimation}
     */
    addSubjects: function(subjects) {
      subjects = tools.isArray(subjects) ? subjects : [subjects];
      forEach(subjects, this.addSubject, this);
      return this;
    },

    /**
     * Removes a subject from the animation
     *
     * @param {Object} subject The subject to remove
     */
    removeSubject: function(subject) {
      var subjects = this.subjects;
      // Reverse search order to make splicing safe
      for (var i = subjects.length - 1; i >= 0; i -= 1) {
        if (subjects[i].subject === subject) {
          subjects.splice(i, 1);
        }
      }
    },

    /**
     * Removes a subject from the animation
     *
     * @param {Object[]} subjects Array of subjects to remove (usually display objects)
     * @return {KeyframeAnimation}
     */
    removeSubjects: function(subjects) {
      forEach(subjects, this.removeSubject, this);
      return this;
    },

    /**
     * Creates a PropertiesTween object for each phase of the keyframe animation.
     * Note that the startValues may have undefined properties, these need to be
     * ignored.
     *
     * @private
     * @param {Object} startValues The initial values of the tween
     * @return {PropertiesTween[]}
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
     * Note that the initialValues may have undefined properties,
     * these need to be ignored.
     *
     * @private
     * @param {Object} initialValues
     */
    _fillInProperties: function(initialValues) {

      var easing = this.easing,
          duration = this.duration,
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
              nextFrame = duration;
            }

            fromValues = {};
            fromValues[p] = prevValue;
            toValues = {};
            toValues[p] = nextValue;

            // Calculate would-be progress of keyframe:
            progress = (frame - prevFrame) / (nextFrame - prevFrame);

            if (easing) {
              progress = easing(progress);
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
     * @param {Object[]} keyframes
     * @return {Object} keyframes (new object, input cleaned)
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
