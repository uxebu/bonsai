define(['../../../color'], function(color) {
  'use strict';

  /**
   * Animation translations for gradients
   * Can only animate the cx, cy, radius and color stops of a gradient
   * `this` is mutable data object, `values` is actual values passed to animation
   * @ignore
   */

  function translation(prop) {
    // prop = strokeGradient OR fillGradient
    return {
      toNumeric: function(gradient) {

        var stops = gradient.stops,
            c;

        var numbers = [];

        this.mutableGradient = gradient.clone();

        if (gradient.matrix) {
          this.hasMatrix = true;
          numbers.push(
            gradient.matrix.a,
            gradient.matrix.b,
            gradient.matrix.c,
            gradient.matrix.d,
            gradient.matrix.tx,
            gradient.matrix.ty
          );
        }

        if (gradient.type === 'linear-gradient') {
          if (!isNaN(gradient.direction)) {
            this.hasDirection = true;
            numbers.push(gradient.direction);
          }
        } else {
          // radial
          this.hasRadius = true;
          this.radiusUnit = (String(gradient.radius).match(/\D$/)||[''])[0];
          numbers.push(parseFloat(gradient.radius));
        }

        // Break up stops so we can animate them individually

        for (var i = 0, l = stops.length; i < l; ++i) {
          c = color(stops[i][0]);
          numbers.push(c.r(), c.g(), c.b(), c.a(), stops[i][1]);
        }
        
        return numbers;
      },
      toAttr: function(numbers) {

        var mutableGradient = this.mutableGradient;
        var n = 0;

        if (mutableGradient.matrix) {
          mutableGradient.matrix.a = numbers[n++];
          mutableGradient.matrix.b = numbers[n++];
          mutableGradient.matrix.c = numbers[n++];
          mutableGradient.matrix.d = numbers[n++];
          mutableGradient.matrix.tx = numbers[n++];
          mutableGradient.matrix.ty = numbers[n++];
        }

        if (this.hasDirection) {
          mutableGradient.direction = numbers[n++];;
        } else {
          // radial
          mutableGradient.radius = numbers[n++] + this.radiusUnit;
        }

        var stops = mutableGradient.stops;

        // Put animated stop colors/positions back into original formation
        for (var i = 0, l = stops.length; i < l; ++i) {
          stops[i][0] = +new color.RGBAColor(
            numbers[n++],
            numbers[n++],
            numbers[n++],
            numbers[n++]
          );
          stops[i][1] = numbers[n++];
        }

        return mutableGradient;
      }
    };
  }

  return {
    fillGradient: translation('fillGradient'),
    strokeGradient: translation('strokeGradient')
  };
});
