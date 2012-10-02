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

  function PropertyTween(startValue, endValue, translator) {
    this.numericStartValues = translator ? translator.toNumeric(startValue) : [startValue];
    this.numericEndValues = translator ? translator.toNumeric(endValue) : [endValue];
    this.length = this.numericStartValues.length;
    this.translator = translator;
  }

  PropertyTween.prototype.at = function(progress) {

    var numericStartValues = this.numericStartValues,
        numericEndValues = this.numericEndValues,
        numericCurrentValues = [];

    for (var i = 0, l = this.length; i < l; ++i) {
      var startValue = numericStartValues[i],
          endValue = numericEndValues[i];
      numericCurrentValues[i] = startValue + (endValue - startValue) * progress;
    }

    return this.translator ?
      this.translator.toUnique(numericCurrentValues) :
      numericCurrentValues[0];

  };

  return PropertyTween;

});