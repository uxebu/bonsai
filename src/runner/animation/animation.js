/** @module animation */
define([
  './keyframe_animation'
], function(KeyframeAnimation) {
  'use strict';

  /**
   * Simplified alias for KeyframeAnimation
   *
   * @constructor (but returns a KeyframeAnimation instance!)
   * @name Animation
   * @memberOf module:animation
   *
   * @param {EventEmitter} clock An object that emits a 'tick' event and
   *  has a `toFrameNumber` method.
   * @param {Number|String} duration The duration, either as frames (number),
   *  seconds (e.g. '1s'), milliseconds (e.g. '100ms') or as a percentage
   *  of the clock's total frames (e.g. '23%')
   * @param {Object} [endValues] The properties/values to animate
   * @param {Object} [options] Additional options
   * @property {String|Function} [options.easing] Easing function. Either the name
   *  of a predefined or a custom function
   * @property {Boolean} [options.isTimelineBound] Boolean indicating whether this
   *  animation should be bound to the timeline, and respond to isPlaying state,
   *  or play regardless of timeline's progress.
   * @property {Array|Object} [options.subjects] The subject(s) (DisplayObjects) of
   *    the animation
   * @property {string|Object} [options.strategy='attr'] The strategy to use to
   *    get and set properties on the subject.
   * @property {Number|String} [options.delay=0] Delay before animation begins, in
   *  frames or seconds
   * @property {Number} [options.repeat=0] The number of repetitions.
   * @returns {Animation} An Animation instance
   *
   * @mixes EventEmitter
   * @return {KeyframeAnimation}
   */
  function Animation(clock, duration, endValues, options) {

    return new KeyframeAnimation(clock, duration, {
      // `to` will be interpreted as setting 100%
      // so at 100% of the animation, this object
      // should look like endValues
      to: endValues
    }, options);

  }

  return Animation;
});
