/** @module animation */
define([
  './easing',
  '../timeline',
  '../../tools',
  '../../event_emitter',
  '../../color',
  './properties_tween'
], function(
  easing, Timeline, tools, EventEmitter, color, PropertiesTween
) {
  'use strict';

  var mixin = tools.mixin;
  var isArray = tools.isArray;
  var forEach = tools.forEach;

  /**
   * The animation class stuff
   *
   * @constructor
   * @name Animation
   * @memberOf module:animation
   * @param {EventEmitter} clock An object that emits a 'tick' event and
   *  has a `toFrameNumber` method.
   * @param {Number|String} duration The duration, either as frames (number),
   *  seconds (e.g. '1s'), milliseconds (e.g. '100ms') or as a percentage
   *  of the clock's total frames (e.g. '23%')
   * @param {Object} [properties] The properties/values to animate
   * @param {Object} [options] Additional options
   * @param {String|Function} [options.easing] Easing function. Either the name
   *  of a predefined or a custom function
   * @param {Boolean} [options.isTimelineBound] Boolean indicating whether this
   *  animation should be bound to the timeline, and respond to isPlaying state,
   *  or play regardless of timeline's progress.
   * @param {Array|Object} [options.subjects] The subject(s) (DisplayObjects) of
   *    the animation
   * @param {string|Object} [options.strategy='attr'] The strategy to use to
   *    get and set properties on the subject.
   * @param {Number|String} [options.delay=0] Delay before animation begins, in
   *  frames or seconds
   * @param {Number} [options.repeat=0] The number of repetitions.
   * @returns {Animation} An Animation instance
   *
   * @mixes EventEmitter
   */
  function Animation(clock, duration, endValues, options) {

    if (duration instanceof Animation) {
      return duration.clone();
    }

    this.subjects = [];

    options = this.options = options || {};

    // Unless specified as false, we assume it to be timeline-bound:
    this.isTimelineBound = options.isTimelineBound !== false;

    this._parseEventProps(options);

    var easingFunc = options.easing;
    this.easing = typeof easingFunc == 'function' ?
      easingFunc : easing[easingFunc];

    this.clock = clock;

    // Make sure it's a whole number. If it's not, then progress'll never land on 1
    this.duration = Math.floor(+duration || clock.toFrameNumber(duration));
    this.repeat = (options.repeat || 0) - (options.repeat % 1 || 0);

    this.delay = options.delay && clock.toFrameNumber(options.delay) || 0;
    this.endValues = endValues = tools.mixin({}, endValues);
    this._cleanEndValues();
    this._init();

  }

  Animation.prototype = /** @lends module:animation.Animation.prototype */ {

    /**
     * Cleans values by removing any that are NaN && falsey, or any
     * NaN values that don't have appropriate translators available:
     *
     * @private
     */
    _cleanEndValues: function() {
      var properties = this.properties;
      for (var name in properties) {
        if (isNaN(properties[name])) {
          if (!properties[name] || !(name in propertyTranslations)) {
            delete properties[name];
          }
        }
      }
    },

    /**
     * Setup onStep callback
     *
     * @private
     */
    _init: function() {

      var anim = this,
          delay = this.delay,
          options = this.options;

      this.frame = 0;

      var lastFrame;

      this.onStep = function onStep(_, frameNumber, timelineIsFinished) {

        if (delay > 0 && delay--) {
          return;
        }

        // lastFrame defaults to the current frame
        // (this'll be at the start of an animation)
        lastFrame = lastFrame || frameNumber;

        var duration = anim.duration,
            frame = anim.frame = anim.isTimelineBound ? (
              // Increment by how many missing frames there were
              anim.frame + ((frameNumber - lastFrame) || 1)
            ) : anim.frame + 1;

        anim.step(frame / duration);

        if (
          (anim.isTimelineBound && timelineIsFinished) ||
          frame === duration
        ) {
          lastFrame = 0;
          delay = anim.delay;
          anim.reset();
          if (anim.repeat-- > 0) {
            anim.play();
          } else {
            anim.emit('end', anim);
          }
          return;
        }

        lastFrame = frameNumber;
      };

      if (options.subjects) {
        this.addSubjects(options.subjects, options.strategy);
      }
    },

    /**
     * Starts or resumes the animation.
     *
     * @returns {this}
     */
    play: function() {

      if (!this.subjects) {
        throw new Error('Unspecified subjects.');
      }

      if (this.isPlaying) {
        return this;
      }

      this.clock.on(this.isTimelineBound ? 'advance' : 'tick', this.onStep);

      if (this.frame === 0) {
        this.emit('beforebegin', this);
      }

      this.emit('play', this);
      this.isPlaying = true;

      return this;
    },

    /**
     * Halts the animation.
     *
     * @returns {this}
     */
    pause: function() {
      this.clock.removeListener(this.isTimelineBound ? 'advance' : 'tick', this.onStep);
      this.emit('pause', this);
      this.isPlaying = false;
    },

    /**
     * Clones the current animation.
     *
     * @returns {Animation} The clone
     */
    clone: function() {
      var options = {
        clock: this.clock,
        duration: this.duration,
        easing: this.easing,
        isTimelineBound: this.isTimelineBound
      };
      return new Animation(this.clock, this.duration, mixin({}, this.properties), options);
    },

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
     * Reset an animation
     *
     * @returns {this}
     */
    reset: function() {

      this.frame = 0;
      this.isPlaying = false;
      this.clock.removeListener(this.isTimelineBound ? 'advance' : 'tick', this.onStep);

      return this;
    },

    /**
     * Adds a subject with given strategy to the animation
     * @param {Object} subject The subject (usually a DisplayObject)
     */
    addSubject: function(subject) {

      var values = subject.attr();

      for (var i in values) {
        if (!(i in this.endValues)) {
          delete values[i];
        }
      }

      this.subjects.push({
        subject: subject,
        tween: new PropertiesTween(values, this.endValues, this.easingFunc)
      });

      return this;
    },

    /**
     * Adds multiple subjects to the animation
     * @param {Array} subjects Array of subjects to add
     */
    addSubjects: function(subjects) {
      subjects = isArray(subjects) ? subjects : [subjects];
      forEach(subjects, function(subject) {
        this.addSubject(subject);
      }, this);
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
        }
      }
    },

    /**
     * Removes a subject with given strategy to the animation
     * @param {Array} subjects Array of subjects to remove
     */
    removeSubjects: function(subjects) {
      forEach(subjects, function(subject) {
        this.removeSubject(subject);
      }, this);
      return this;
    },

    /**
     * A single step in an animation
     *
     * @param {number} progress Progress between 0 and 1
     * @returns {this}
     */
    step: function(progress) {

      var subjects = this.subjects,
          easingFn = this.easing;

      if (easingFn) {
        progress = easingFn(progress);
      }

      for (var s = 0, sl = subjects.length; s < sl; ++s) {
        subjects[s].subject.attr(
          subjects[s].tween.at(progress)
        );
      }

      return this;
    }
  };

  mixin(Animation.prototype, EventEmitter);

  return Animation;
});
