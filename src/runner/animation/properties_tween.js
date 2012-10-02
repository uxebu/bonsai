define([
  '../../tools',
  './property_tween',
  './color_translations',
  './gradient_translations',
  './filter_translations',
  './segment_translations',
  './matrix_translations',
  './corner_radius_translations'
], function(
  tools, PropertyTween,
  colorTranslations, gradientTranslations, filterTranslations,
  segmentTranslations, matrixTranslations, cornerRadiusTranslations
) {

  var mixin = tools.mixin;

  /**
   * Translations, in the form of:
   * { toNumber: function(){}, toUnique: function(){} }
   */
  var propertyTranslations = PropertiesTween.propertyTranslations = {};

  mixin(propertyTranslations, colorTranslations);
  mixin(propertyTranslations, gradientTranslations);
  mixin(propertyTranslations, filterTranslations);
  mixin(propertyTranslations, segmentTranslations);
  mixin(propertyTranslations, matrixTranslations);
  mixin(propertyTranslations, cornerRadiusTranslations);

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
            propertyTranslations[property],
            easingFn
          )
        );
      }

    }
  };

  return PropertiesTween;

});