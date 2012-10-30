define([
  '../event_emitter',
  '../tools'
], function (EventEmitter, tools) {
  'use strict';

  var round = Math.round;

  /**
   * The Timeline mixin. It contains timeline functionality (controls a series
   * of frames).
   *
   * @name Timeline
   * @mixin
   * @mixes event_emitter
   */
  var Timeline = /** @lends Timeline */ {
    /**
     * The number of the current frame. Zero-indexed.
     *
     *
     */
    currentFrame: 0,

    /**
     * Whether the timeline is playing
     */
    isPlaying: true,

    /**
     * Increments the frame
     */
    incrementFrame: function() {
      // If length if not defined, we we assume an infinite length.
      var length = this._length == null ? Infinity : this._length;
      this.currentFrame = (this.currentFrame + 1) % length || 0;
      return this;
    },

    /**
     * Emits events for the current frame
     */
    emitFrame: function() {

      var currentFrame = this.currentFrame,
          skipFrame = this.skipFrame;

      this.emit('tick', this, currentFrame);

      if (!this.isPlaying) {
        return;
      }

      // If skipFrame is null/undefined then we can emit, but if the currentFrame
      // is marked to be skipped (skipFrame==currentFrame) then we don't emit.
      if (null == this.skipFrame || this.skipFrame != currentFrame) {
        this.emit(String(currentFrame), this, currentFrame);
        this.emit('advance', this, currentFrame);
      }

      if (this.skipFrame === skipFrame) {
        // Frame [event] emission has not affected skipFrame, NULL it:
        this.skipFrame = null;
      }

    },

    /**
     * Adds frames to the timeline. Each frame is a function. Existing frames
     * are overwritten.
     *
     * The `newFrames` parameter can be an array where each index represents a
     * frame, or an object, where keys may be a number plus a unit seconds,
     * percents), e.g. `25`, `5s`, `30%`. Percentages relate to the current
     * length of the timeline.
     *
     * @param {Array|Object} frames The frames to add
     * @returns {this}
     */
    frames: function(frames) {
      var framenumber, name;
      var maxFrame = 0;

      for (name in frames) {
        framenumber = this.toFrameNumber(name);

        if (framenumber > maxFrame) {
          maxFrame = framenumber;
        }

        this.on(framenumber, frames[name]);
      }

      if (maxFrame > this.length()) {
        this._length = maxFrame + 1;
      }

      return this;
    },

    /**
     * Gets or sets the number of frames in the movie.
     *
     * @param {number} [numFrames]
     * @returns {number|this}
     */
    length: function(numFrames) {
      var length = this._length || (this._length = 0);
      if (!arguments.length) {
        return length;
      }

      numFrames *= 1;

      // remove unused callbacks
      while (length-- >= numFrames) {
        this.removeAllListeners(length);
      }

      this._length = numFrames;
      return this;
    },

    /**
     * Continues playback. If frame is passed, jump to that frame before.
     *
     * @param {number|string} [frame] A frame number or time expression.
     * @returns {this}
     */
    play: function(frame) {
      frame *= 1;
      this.isPlaying = true;

      if (frame >= 0) {
        this.currentFrame = frame;
        this.emit(frame + '', this, frame);
        this.skipFrame = frame;
      }

      return this;
    },

    /**
     * Stops playback. If frame is passed, go to that frame before.
     *
     * @param {number} [frame] A frame number or time expression.
     * @returns {this}
     */
    stop: function(frame) {
      frame *= 1;
      this.isPlaying = false;

      if (frame >= 0 && frame < this.length()) {
        this.currentFrame = frame;
        this.emit(frame + '', this, frame);
        this.skipFrame = frame;
      }

      return this;
    },

    /**
     * Converts a seconds or percentages to a frame number.
     *
     * @param {string} time A duration in seconds (e.g. '5s') or a percentage
     *  (e.g. 15%). To parse percentages, the timeline needs to have a length;
     * @returns {number} A frame number
     */
    toFrameNumber: function(time) {

      if (time == +time) { // numerical frame label has been passed
        return +time;
      }
      if (time == 'from' || time == 'start') {
        return 0;
      }
      if (time == 'to' || time == 'end') {
        return this._length;
      }

      var bits = /^([\d.]+)(\D+)$/.exec(time) || [];
      switch (bits[2]) { // unit
        case 'ms':
          bits[1] /= 1000;
        // fallthrough intended
        case 's':
          var framerate = this.framerate || this.root.framerate;
          return round(bits[1] * framerate);
        case '%':
          // accessing `_length` is cheated, but this method might be called often
          return round(this._length * bits[1] / 100) || 0;
        default:
          throw new Error('Unknown frame format: ' + bits[2]);
      }
    }

  };

  return tools.mixin(Timeline, EventEmitter);
});
