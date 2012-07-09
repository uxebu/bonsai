define(['../../color'], function(color) {
  'use strict';

  /**
   * Animation translations for color properties
   */

  return {
    lineColor: makeColorTranslationSpec('lineColor'),
    fillColor: makeColorTranslationSpec('fillColor')
  };

  function makeColorTranslationSpec(prop) {
    return {
      setup: function(values) {
        var c = color(values[prop]);
        values[prop + '_r'] = c.r();
        values[prop + '_g'] = c.g();
        values[prop + '_b'] = c.b();
        values[prop + '_a'] = c.a();
        delete values[prop];
      },
      step: function(values) {
        values[prop] = '' + new color.RGBAColor(
          values[prop + '_r'],
          values[prop + '_g'],
          values[prop + '_b'],
          values[prop + '_a']
        );
        delete values[prop + '_r'];
        delete values[prop + '_g'];
        delete values[prop + '_b'];
        delete values[prop + '_a'];
      }
    };
  }
});
