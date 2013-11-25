define([
  '../../tools',
  './property_tween',
  './translators/color',
  './translators/gradient',
  './translators/filter',
  './translators/segment',
  './translators/matrix',
  './translators/corner_radius',
  './translators/stroke_dash'
], function(
  tools, PropertyTween,
  colorTranslators, gradientTranslators, filterTranslators,
  segmentTranslators, matrixTranslators, cornerRadiusTranslators,
  strokeDashTranslators
) {

  var mixin = tools.mixin;
  var forEach = tools.forEach;

  /**
   * Translators, in the form of:
   * { toNumber: function(){}, toAttr: function(){} }
   */
  var translators = PropertiesTween.propertyTranslators = {};

  mixin(translators, colorTranslators);
  mixin(translators, gradientTranslators);
  mixin(translators, filterTranslators);
  mixin(translators, segmentTranslators);
  mixin(translators, matrixTranslators);
  mixin(translators, cornerRadiusTranslators);
  mixin(translators, strokeDashTranslators);

  /**
   * Constructs an instance of PropertiesTween which takes care of tweening
   * a set of properties from one state to another, using any necessary
   * property translators (e.g. colors get split into r,g,b,a for tweening)
   *
   * @constructor
   * @name PropertiesTween
   * @private
   * @param {Object} propertiesFrom Properties and their initial values
   * @param {Object} propertiesTo Properties and their end values
   */
  function PropertiesTween(propertiesFrom, propertiesTo) {

    this.propertiesFrom = mixin({}, propertiesFrom);
    this.propertiesTo = mixin({}, propertiesTo);

    // Delete values in startVals that do not exist in endVals
    for (var i in this.propertiesFrom) {
      if (!(i in this.propertiesTo)) {
        delete this.propertiesFrom[i];
      }
    }

    // note: only process properties that actually have a value!
    // TOFIX: confirm that this shouldn't be fixed upstream (that unused properties should not be set at all)
    this.propertyNames = Object.keys(this.propertiesFrom)
      .filter(function(name){ return this.propertiesFrom[name] !== undefined && this.propertiesTo[name] !== undefined; },this);

    this.propertyLength = this.propertyNames.length;
    this.propertyTweens = [];
    this._setupTweens();
    this._values = {};

  }

  PropertiesTween.prototype = {

    /**
     * Returns all values at the passed progress
     *
     * @param progress
     */
    at: function(progress) {

      var values = this._values,
          propertyTweens = this.propertyTweens,
          propertyNames = this.propertyNames;

      for (var i = 0, l = this.propertyLength; i < l; ++i) {
        values[propertyNames[i]] = propertyTweens[i].at(progress);
      }

      return values;

    },

    /**
     * Sets up all individual property tweens (passing the translator so that
     * PropertyTween can take care of component pieces, e.g. color->r,g,b,a)
      */
    _setupTweens: function() {

      var propertiesFrom = this.propertiesFrom,
          propertiesTo = this.propertiesTo,
          propertyNames = this.propertyNames,
          propertyTweens = this.propertyTweens;

      forEach(propertyNames, function(property) {
        propertyTweens.push(
          new PropertyTween(
            propertiesFrom[property],
            propertiesTo[property],
            translators[property]
          )
        );
      });

    }
  };

  return PropertiesTween;

});
