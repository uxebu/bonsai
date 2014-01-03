define(function() {

  'use strict';

  if (!window)
    throw new Error('global window object is mandatory');

  var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };

  var cancelAnimFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame ||
    window.mozCancelAnimationFrame || function(id) {
      window.clearTimeout(id);
    };

  function AnimationFrame() {
    this._id = null;
    this._callback = null;
    this._isFrameRequested = false;
  }

  AnimationFrame.prototype = {

    setFrameCallback: function(callback) {
      this._callback = callback;
    },

    cancel: function() {
      if (this._id)
        cancelAnimFrame(this._id);
    },

    request: function() {
      var self = this;

      if (self._isFrameRequested)
        return;

      self._isFrameRequested = true;
      self._id = requestAnimFrame(function(time) {
        self._isFrameRequested = false;
        self._callback(time);
      });
    }

  };

  return AnimationFrame;

});
