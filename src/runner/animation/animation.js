/** @module animation */
define([
  './easing',
  '../timeline',
  '../../tools',
  '../../event_emitter',
  '../../color',
  './color_translations',
  './gradient_translations',
  './filter_translations',
  './segment_translations',
  './matrix_translations',
  './corner_radius_translations'
], function(
  easing, Timeline, tools, EventEmitter, color,
  colorTranslations, gradientTranslations, filterTranslations,
  segmentTranslations, matrixTranslations, cornerRadiusTranslations
) {
  'use strict';

  var mixin = tools.mixin;

  /**
   * Translations, in the form of:
   * { setup: function(){}, step: function(){} }
   * --
   * `setupTo` will be called to translate the `to` properties (i.e. the ones
   *         passed as the 2nd arg to the Animation constructor)
   * `setupFrom` will be called to translate the initial values in the subject
   *         of the animation.
   * `step`  will be called to translate values (back) on every step of
   *         the animation.
   * --
   * Both functions should mutate values to represent numerical animitable data
   * Any other data can be saved to `this` which is a data object accessible
   * to all.
   * --
   * setupFrom and setupTo can be defined as a single method, setup, if desired.
   */
  var propertyTranslations = Animation.propertyTranslations = {};

  mixin(propertyTranslations, colorTranslations);
  mixin(propertyTranslations, gradientTranslations);
  mixin(propertyTranslations, filterTranslations);
  mixin(propertyTranslations, segmentTranslations);
  mixin(propertyTranslations, matrixTranslations);
  mixin(propertyTranslations, cornerRadiusTranslations);

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
  function Animation(clock, duration, properties, options) {

    if (duration instanceof Animation) {
      return duration.clone();
    }

    // Maintain subject map (to check duplicant IDs) and regular array:
    this.subjectsById = {};
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
    this.properties = properties = tools.mixin({}, properties);
    this._cleanProperties();
    this.propertyNames = Object.keys(properties);

    this.translations = options.translate ? [options.translate] : [];
    this._translationData = {};
    this._getTranslations();
    this._runTranslations(properties, 'setupTo');

    this.propertyNames = Object.keys(properties); // must get new keys [from translation], if any

    this.strategy = options.strategy;

    this._bind();
  }

  Animation.prototype = /** @lends module:animation.Animation.prototype */ {

    /**
     * Cleans properties by removing any that are NaN && falsey, or any
     * NaN values that don't have appropriate translations available:
     *
     * @private
     */
    _cleanProperties: function() {
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
    _bind: function() {

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
            anim.emit('end', anim.subject, anim);
          }
          return;
        }

        lastFrame = frameNumber;
      };

      if (options.subjects) {
        this.setSubjects(options.subjects, options.strategy);
      }
    },

    /**
     * Get initial translations. E.g. for `fill` and `line` (color translations)
     *
     * @private
     */
    _getTranslations: function() {
      var propertyNames = this.propertyNames,
          translation;

      for (var i = 0, len = propertyNames.length; i < len; i++) {
        if (propertyNames[i] in propertyTranslations) {

          translation = propertyTranslations[propertyNames[i]];

          if (!(
            typeof translation.step == 'function' &&
            (
              typeof translation.setupFrom == 'function' &&
              typeof translation.setupTo == 'function'
            ) || typeof translation.setup == 'function'
          )) {
            throw Error(
              'Translation does not implement setup (or setupFrom & setupTo) and step methods.'
            );
          }

          this.translations.push({
            methods: translation,
            // Data object for this translations (can store arbitrary data here)
            // It's unique to the translation
            // This'll be referenced as `this` within translation methods
            data: this._translationData[propertyNames[i]] = {}
          });
        }
      }
    },

    /**
     * Run passed method of all translations on passed values.
     *
     * @private
     */
    _runTranslations: function(values, methodName) {
      var translation, method;
      for (var i = this.translations.length; i--;) {

        translation = this.translations[i];

        // If method is setupFrom or setupTo, but it's not defined, then
        // fall-back on 'setup' method (which should deal with both)
        method = methodName === 'setupFrom' || methodName === 'setupTo' ?
          translation.methods[methodName] || translation.methods.setup :
          translation.methods[methodName];

        method.call(translation.data, values);
      }
    },

    /**
     * Starts or resumes the animation.
     *
     * Optionally changes the subject of the animation.
     *
     * @param {Object} [subject]
     * @param {mixed} [strategy='attr'] The set/get strategy to use
     *   - 'attr': The 'attr' method of the object is used (for DisplayObjects)
     *   - 'prop': Normal property setting and getting is used
     *   - Object with 'set(subject, values)' and 'get(subject, propertyNames)'
     *     methods.
     * @returns {this}
     */
    play: function(subjects, strategy) {

      var me = this;

      if (subjects) {
        this.addSubjects(subjects, strategy);
      }

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
     * @param {mixed} [strategy='attr'] The set/get strategy to use
     *   - 'attr': The 'attr' method of the object is used (for DisplayObjects)
     *   - 'prop': Normal property setting and getting is used
     *   - Object with 'set(subject, values)' and 'get(subject)'
     *     methods.
     */
    addSubject: function(subject, strategy) {

      var propertyNames = this.propertyNames,
          values;

      strategy = strategy || this.strategy || 'attr';

      // Store initial values

      switch (strategy) {
        case 'attr':
          values = subject.attr();
          break;
        case 'prop':
          values = {};
          for (var i = 0, key; (key = propertyNames[i++]); ) {
            values[key] = subject[key];
          }
          break;
        default: // assume object with get/set methods
          values = strategy.get(subject, this.propertyNames);
          break;
      }

      this._runTranslations(values, 'setupFrom');

      if (!(subject.id in this.subjectsById)) {
        this.subjectsById[subject.id] = true;
        this.subjects.push({
          subject: subject,
          strategy: strategy,
          values: values
        });
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
      if (subject.id in this.subjectsById) {
        for (var i = 0, l = this.subjects.length; i < l; ++i) {
          if (this.subjects[i].subject === subject) {
            this.subjects.splice(i, 1);
            break;
          }
        }
        delete this.subjectsById[subject.id];
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
     * A single step in an animation
     *
     * @param {number} progress Progress between 0 and 1
     * @returns {this}
     */
    step: function(progress) {

      var strategy,
          subject,
          from,
          fromValues,
          key,
          to,
          isAttrStrategy,
          hasTranslations = !!this.translations.length,
          easingFunc = this.easing,
          endValues = this.properties,
          initialValues = this.initialValues,
          propertyNames = this.propertyNames,
          pl = propertyNames.length,
          subjects = this.subjects,
          values = {};

      if (easingFunc) {
        progress = easingFunc(progress);
      }

      for (var s = 0, sl = subjects.length; s < sl; ++s) {

        fromValues = subjects[s].values;
        subject = subjects[s].subject;
        strategy = subjects[s].strategy;
        isAttrStrategy = strategy === 'attr'

        var subjectAttributes = subject._attributes;
        var subjectMutatedAttributes = subject._mutatedAttributes;

        // loop through all properties and calculate the value
        for (var p = 0; p < pl; ++p) {

          key = propertyNames[p];
          from = fromValues[key];
          to = endValues[key];

          if (!hasTranslations && isAttrStrategy) {
            // Optimal method (no translations):
            subjectAttributes[key] = from + (to - from) * progress;
            subjectMutatedAttributes[key] = true;
          } else {
            values[key] = from + (to - from) * progress;
          }
        }

        if (!hasTranslations && isAttrStrategy) {
          // We've already set them the optimal way. Continue:
          subject.markUpdate();
          continue;
        }

        this._runTranslations(values, 'step');

        if (strategy === 'attr') {
          subject.attr(values);
        } else if (strategy === 'prop') {
          for (var key in values) {
            subject[key] = values[key];
          }
        } else {
          strategy.set(subject, values);
        }
      }

      return this;
    }
  };

  mixin(Animation.prototype, EventEmitter);

  return Animation;
});
