define([
  '../../tools',
  './property_tween',
  './translators/color',
  './translators/gradient',
  './translators/filter',
  './translators/segment',
  './translators/matrix',
  './translators/corner_radius'
], function(
  tools, PropertyTween,
  colorTranslators, gradientTranslators, filterTranslators,
  segmentTranslators, matrixTranslators, cornerRadiusTranslators
) {

  var mixin = tools.mixin;

  /**
   * Translators, in the form of:
   * { toNumber: function(){}, toUnique: function(){} }
   */
  var propertyTranslators = PropertiesTween.propertyTranslators = {};

  mixin(propertyTranslators, colorTranslators);
  mixin(propertyTranslators, gradientTranslators);
  mixin(propertyTranslators, filterTranslators);
  mixin(propertyTranslators, segmentTranslators);
  mixin(propertyTranslators, matrixTranslators);
  mixin(propertyTranslators, cornerRadiusTranslators);

  function PropertiesTween(propertiesFrom, propertiesTo, easingFn) {

    this.easingFn = easingFn;
    this.propertiesFrom = tools.mixin({}, propertiesFrom);
    this.propertiesTo = tools.mixin({}, propertiesTo);

    // Delete values in startVals that do not exist in endVals
    for (var i in this.propertiesFrom) {
      if (!(i in this.propertiesTo)) {
        delete this.propertiesFrom[i];
      }
    }

    this.propertyNames = Object.keys(this.propertiesFrom);
    this.propertyLength = this.propertyNames.length;
    this.propertyTweens = [];
    this._setupTweens();
    this._values = {};

  }

  PropertiesTween.prototype = {

    at: function(progress) {

      var values = this._values,
          propertyTweens = this.propertyTweens,
          propertyNames = this.propertyNames;

      for (var i = 0, l = this.propertyLength; i < l; ++i) {
        values[propertyNames[i]] = propertyTweens[i].at(progress);
      }

      return values;

    },

    _setupTweens: function() {

      var easingFn = this.easingFn,
          propertiesFrom = this.propertiesFrom,
          propertiesTo = this.propertiesTo,
          propertyNames = this.propertyNames,
          propertyTweens = this.propertyTweens;

      for (var i = 0, l = this.propertyLength; i < l; ++i) {
        var property = propertyNames[i];
        propertyTweens.push(
          new PropertyTween(
            propertiesFrom[property],
            propertiesTo[property],
            propertyTranslators[property],
            easingFn
          )
        );
      }

    }
  };

  return PropertiesTween;

});