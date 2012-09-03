define([
  './animation',
  './easing',
  '../../tools',
  '../../event_emitter'
], function(Animation, easing, tools, EventEmitter) {
  'use strict';

  var max = Math.max,
      round = Math.round,
      hasOwn = {}.hasOwnProperty;

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
   * @param {Number} [options.delay] Delay before animation begins, in ms
   *  @param {Array|Object} [options.subjects] The subject(s) (e.g. DisplayObjects) of
   *    the keyframe-animation
   *  @param {string|Object} [options.strategy='attr'] The strategy to use to
   *    get and set properties on the subjects.
   * @returns {KeyframeAnimation} An KeyframeAnimation instance
   *
   * @mixes EventEmitter
   */
  function KeyframeAnimation(clock, duration, keyframes, options) {
    options || (options = {});

    this.clock = clock;
    duration = this.duration = +duration || clock.toFrameNumber(duration);

    this.subjects = [];
    this.animations = [];
    this.initialValues = null;
    this.currentAnimation = -1;

    this.repeat = options.repeat || 0;
    this.easing = options.easing;

    this.keyframes = this._convertKeysToFrames(keyframes);
    // Get numerical keys (frame-numbers) and sort
    this.keys = Object.keys(this.keyframes).map(Number);
    this.keys.sort(function(a, b){ return a - b; });

    if (options.subjects) {
      this.setSubjects(options.subjects, options.strategy);
    }
  }


  KeyframeAnimation.prototype = /** @lends module:animation.KeyframeAnimation.prototype */ {

    /**
     * Starts or resumes an animation
     *
     * Optionally changes the subjects of the animation.
     *
     * @param {Object} [subjects]
     * @param {mixed} [strategy='attr'] The set/get strategy to use
     *   - 'attr': The 'attr' method of the object is used (for DisplayObjects)
     *   - 'prop': Normal property setting and getting is used
     *   - Object with 'set(subject, values)' and 'get(subject, propertyNames)'
     *     methods.
     */
    play: function(subjects, strategy) {

      if (subjects) {
        this.setSubjects(subjects, strategy);
      }

      if (this.currentAnimation < 0) {
        this.begin();
        return;
      }

      this.animations[this.currentAnimation].isPlaying = true;

      return this;
    },

    /**
     * Pauses an animation
     */
    pause: function() {
      if (this.currentAnimation > -1) {
        this.animations[this.currentAnimation].isPlaying = false;
      }

      return this;
    },

    /**
     * Resets an animation (so it's ready to begin again)
     */
    reset: function() {
      this.animations.forEach(function(animation) {
        animation.reset();
      });
      this.currentAnimation = -1;

      return this;
    },

    /**
     * Begins the animation
     */
    begin: function() {

      var initial = this.keyframes[0],
          subjects = this.subjects,
          strategy,
          subject;

      if (initial && subjects.length) {
        for (var i = 0, l = subjects.length; i < l; ++i) {

          subject = subjects[i];
          strategy = subject.strategy;
          subject = subject.subject;
          /*
            Handle the case where initial values are specified and are
            different from the subject's values. We need to set these
            `from` properties manually: (FRAME 0)
          */
          switch (strategy) {
            case 'attr':
              subject.attr(initial);
              break;
            case 'prop':
              for (var p in initial) {
                subject[p] = initial[p];
              }
              break;
            default: // assume object with get/set methods
              strategy.set(subject, initial);
              break;
          }
        }
      }

      this.currentAnimation = 0;

      this.subjects.forEach(function(subj) {
        this.animations[0].addSubject(subj.subject, subj.strategy);
      }, this);
      this.animations[0].play();

      return this;
    },

    /**
     * Adds a subject with given strategy to the keyframe-animation
     * @param {Object} subject The subject (usually a DisplayObject)
     * @param {mixed} [strategy='attr'] The set/get strategy to use
     *   - 'attr': The 'attr' method of the object is used (for DisplayObjects)
     *   - 'prop': Normal property setting and getting is used
     *   - Object with 'set(subject, values)' and 'get(subject)'
     *     methods.
     */
    addSubject: function(subject, strategy) {

      strategy = strategy || this.strategy || 'attr';

      if (this.initialValues == null) {

        switch (strategy) {
          case 'attr':
            this.initialValues = subject.attr();
            break;
          case 'prop':
            var propertyNames = Object.keys(subject);
            this.initialValues = {};
            for (var i = 0, key; (key = propertyNames[i++]); ) {
              this.initialValues[key] = subject[key];
            }
            break;
          default: // assume object with get/set methods
            this.initialValues = strategy.get(subject, this.propertyNames);
            break;
        }
      }

      this.subjects.push({
        subject: subject,
        strategy: strategy
      });

      if (this.animations.length) {
        // Animations have already been created: add subject to all animations
        // so it has effect immediately:
        for (var a = 0, l = this.animations.length; a < l; ++a) {
          this.animations[a].addSubject(subject, strategy);
        }
      } else {
        this._fillInProperties();
        this._createAnimations();
      }

      return this;
    },

    /**
     * Adds multiple subjects with given strategy to the animation
     * @param {Array} subjects Array of subjects to add
     * @param {mixed} [strategy='attr'] The set/get strategy to use
     *   - 'attr': The 'attr' method of the object is used (for DisplayObjects)
     *   - 'prop': Normal property setting and getting is used
     *   - Object with 'set(subject, values)' and 'get(subject)'
     *     methods.
     */
    addSubjects: function(subjects, strategy) {
      var me = this;
      subjects = tools.isArray(subjects) ? subjects : [subjects];
      subjects.forEach(function(subject) {
        me.addSubject(subject, strategy);
      });
      return this;
    },

    /**
     * Removes a subject with given strategy to the animation
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
     * Removes a subject with given strategy to the animation
     * @param {Array} subjects Array of subjects to remove
     */
    removeSubjects: function(subjects) {
      subjects.forEach(tools.hitch(this, 'removeSubject'));
      return this;
    },

    /**
     * Sets the subjects of the animation while wiping all current subjects
     *
     * @param {Object} subject
     * @param {mixed} [strategy='attr'] The set/get strategy to use
     *   - 'attr': The 'attr' method of the object is used (for DisplayObjects)
     *   - 'prop': Normal property setting and getting is used
     *   - Object with 'set(subject, values)' and 'get(subject)'
     *     methods.
     * @returns {this}
     */
    setSubjects: function(subjects, strategy) {

      subjects = tools.isArray(subjects) ? subjects : [subjects];

      this.removeSubjects(this.subjects.map(function(subj) {
        return subj.subject;
      }));
      this.addSubjects(subjects, strategy);

      return this;
    },

    /**
     * Sets the subject of the animation while wiping all current subjects
     *
     * @param {Object} subject
     * @param {mixed} [strategy='attr'] The set/get strategy to use
     *   - 'attr': The 'attr' method of the object is used (for DisplayObjects)
     *   - 'prop': Normal property setting and getting is used
     *   - Object with 'set(subject, values)' and 'get(subject)'
     *     methods.
     */
    setSubject: function(subject, strategy) {
      this.removeSubjects(this.subjects.map(function(subj) {
        return subj.subject;
      }));
      this.addSubject(subject, strategy);
      return this;
    },

    /**
     * Creates an animation for each keyframe transition
     *
     * @private
     */
    _createAnimations: function() {

      var animationDuration,
          totalDuration = 0,
          prevAnimation,
          animations = this.animations,
          keyframes = this.keyframes;

      this.keys.forEach(function(key, i) {

        var animation;

        if (key === 0) { return; } // Don't animate to initial

        // Calculate duration of this individual animation:
        animationDuration = key - totalDuration;
        totalDuration += animationDuration;

        animation = new Animation(
          this.clock,
          animationDuration,
          keyframes[key],
          {
            easing: this.easing,
            strategy: this.strategy
          }
        );

        if (prevAnimation) {
          prevAnimation.on('end', this, function() {
            // Play next animation
            this.currentAnimation++;
            this.subjects.forEach(function(subj) {
              animation.addSubject(subj.subject, subj.strategy);
            }, this);
            animation.play();
          });
        }

        animations.push(animation);

        prevAnimation = animation;

        if (i == this.keys.length - 1) {
          animation.on('end', this, function() {
            // Emit 'end' on KeyframeAnimation instance
            if (this.repeat === Infinity || --this.repeat > 0) {
              this.reset();
              this.play();
            } else {
              this.emit('end', this);
            }
          });
        }
      }, this);
    },

    /**
     * Fills in properties where they are specified in one
     * keyframe but not in another
     *
     * @private
     */
    _fillInProperties: function() {
      var initialValues = this.initialValues,
          lastFrame = this.duration,
          keys = this.keys,
          keyframes = this.keyframes,
          keyframe,
          properties = {};

      // Gather property names:
      keys.forEach(function(key) {

        keyframe = keyframes[key];

        for (var p in keyframe) {
          if (keyframe.hasOwnProperty(p)) {
            properties[p] = true;
          }
        }
      });

      // Fill in (missing) properties:
      keys.forEach(function(frame, i) {

        var prevFrame,
            nextFrame,
            prevValue,
            nextValue,
            p;

        keyframe = keyframes[frame];

        for (p in properties) {
          if (!hasOwn.call(keyframe, p)) {

            prevFrame = getFrameOfLastDefinedProperty(p, i);
            nextFrame = getFrameOfNextDefinedProperty(p, i);
            prevValue = prevFrame && keyframes[prevFrame][p] || initialValues[p];
            nextValue = nextFrame && keyframes[nextFrame][p];

            if (prevValue == null) {
              // TODO: throw this only when the 0th frame does not specify props
              // Ideally, though, initialValues will have the value specified
              throw new Error('No initial value specified for property: ' + p);
            }

            if (nextValue == null) {
              /*
                If there is no next value then the prevValue
                must be the last occurance and thus the end-point
              */
              nextValue = prevValue;
              nextFrame = lastFrame;
            }

            keyframe[p] = nextValue *
                            (frame - prevFrame) / (nextFrame - prevFrame);
          }
        }
      });

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
