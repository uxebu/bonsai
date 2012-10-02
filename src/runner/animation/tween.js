define([
  './easing'
], function(easing) {

  /*TRANSLATOR {
    toNumber: function() {
      return 32234324; // number
    },
    toUnique: function(number) {
      return color('......')
    }
  }*/

  function Tween(startValue, endValue, translator, easingFn) {
    this.startValue = translator ? translator.toNumber(startValue) : startValue;
    this.endValue = translator ? translator.toNumber(endValue) : endValue;
    this.translator = translator;
    this.easingFn = easingFn;
  }

  Tween.prototype.at = function(progress) {
    if (this.easingFn) {
      progress = this.easingFn(progress);
    }
    var startValue = this.startValue,
        endValue = this.endValue,
        value = startValue + (endValue - startValue) * progress,
        translator = this.translator;
    return translator ? translator.toUnique(value) : value;
  };

  return Tween;

});