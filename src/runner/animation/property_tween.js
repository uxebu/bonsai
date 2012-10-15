define(function() {

  /** 
   * Constructs an instance of PropertyTween which takes care of tweening an
   * individual property value. If a translator is passed it is applied to the 
   * property and then each number returned by theTranslator.toNumeric() is 
   * tween separately. E.g. a fillColor property value would be split into 
   * a four-element array, like [r,g,b,a] and each of those values are tweened
   * separately.
   *
   * @constructor
   * @name PropertyTween
   * @private
   * @param {*} startValue Starting value of the tween
   * @param {*} endValue Ending value of the tween
   * @param {Object} [translator] The translator to be applied to values
   * @param {Function} [translator.toNumeric] Is passed a raw start or end
   *  value and returns an array of numbers that can be tweened.
   * @param {Function} [translator.toAttr] Is passed an array of numbers and
   *  returns a value that can be returned by `at()`. This is usually the 
   *  custom value like a color or matrix instance which will be composed from
   *  the tweened numbers in the array.
   */
  function PropertyTween(startValue, endValue, translator) {

    // translationData enables the translator methods to store data relating
    // to a single propertyTween somewhere:
    this.translationData = {};

    this.numericStartValues = translator ? translator.toNumeric.call(this.translationData, startValue, false) : [startValue];
    this.numericEndValues = translator ? translator.toNumeric.call(this.translationData, endValue, true) : [endValue];
    this.length = this.numericStartValues.length;
    this.translator = translator;
  }

  /**
   * Returns the value at the passed progress (translator is applied)
   *
   * @param progress
   */
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
      this.translator.toAttr.call(this.translationData, numericCurrentValues) :
      numericCurrentValues[0];

  };

  return PropertyTween;

});