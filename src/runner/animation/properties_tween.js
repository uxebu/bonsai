define([
  '../../tools',
  './property_tween',
  './color_translators',
  './gradient_translators',
  './filter_translators',
  './segment_translators',
  './matrix_translators',
  './corner_radius_translators'
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
    this.propertiesFrom = propertiesFrom;
    this.propertiesTo = propertiesTo;
    this.propertyNames = Object.keys(propertiesFrom);
    this.propertyLength = this.propertyNames.length;
    this.propertyTweens = [];
    this._setupTweens();

  }

  PropertiesTween.prototype = {

    at: function(progress) {

      var values = {},
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