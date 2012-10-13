define(['../../../color'], function(color) {
  'use strict';

  /**
   * Animation translations for color properties
   * @ignore
   */

  return {
    strokeColor: makeColorTranslationSpec('strokeColor'),
    fillColor: makeColorTranslationSpec('fillColor')
  };

  function makeColorTranslationSpec(prop) {
    return {
      toNumeric: function(c) {
        c = color(c);
        return [c.r(), c.g(), c.b(), c.a()];
      },
      toAttr: function(values) {
        return '' + new color.RGBAColor(
          values[0],
          values[1],
          values[2],
          values[3]
        );
      }
    };
  }
});
