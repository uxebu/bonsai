define(['../../color'], function(color) {
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
      setup: function(values) {

        var stops = values[prop].stops,
            c;

        this[prop] = values[prop].clone();

        if (values[prop].matrix) {
          values[prop + 'MatrixA'] = values[prop].matrix.a;
          values[prop + 'MatrixB'] = values[prop].matrix.b;
          values[prop + 'MatrixC'] = values[prop].matrix.c;
          values[prop + 'MatrixD'] = values[prop].matrix.d;
          values[prop + 'MatrixTX'] = values[prop].matrix.tx;
          values[prop + 'MatrixTY'] = values[prop].matrix.ty;
        }

        if (values[prop].type === 'linear-gradient') {
          if (!isNaN(values[prop].direction)) {
            values[prop + 'Direction'] = values[prop].direction;
          }
        } else {
          // radial
          this[prop + 'RadiusUnit'] = (String(values[prop].radius).match(/\D$/)||[''])[0];
          values[prop + 'Radius'] = parseFloat(values[prop].radius);
        }


        // Break up stops so we can animate them individually

        for (var i = 0, l = stops.length; i < l; ++i) {
          c = color(stops[i][0]);
          values[prop + 'Stop_' + i + 'r'] = c.r();
          values[prop + 'Stop_' + i + 'g'] = c.g();
          values[prop + 'Stop_' + i + 'b'] = c.b();
          values[prop + 'Stop_' + i + 'a'] = c.a();
          if (!isNaN(stops[i][1])) {
            values[prop + 'Stop_' + i + '_pos'] = stops[i][1];
          }
        }

        delete values[prop];
      },
      step: function(values) {

        if (this[prop].matrix) {
          this[prop].matrix.a = values[prop + 'MatrixA'];
          this[prop].matrix.b = values[prop + 'MatrixB'];
          this[prop].matrix.c = values[prop + 'MatrixC'];
          this[prop].matrix.d = values[prop + 'MatrixD'];
          this[prop].matrix.tx = values[prop + 'MatrixTX'];
          this[prop].matrix.ty = values[prop + 'MatrixTY'];
        }

        if (this[prop].type === 'linear-gradient') {
          if (!isNaN(values[prop + 'Direction'])) {
            this[prop].direction = values[prop + 'Direction'];
          }
          delete values[prop + 'Direction'];
        } else {
          // radial
          this[prop].radius = values[prop + 'Radius'] + this[prop + 'RadiusUnit'];
          delete values[prop + 'Radius'];
        }

        var stops = this[prop].stops;

        // Put animated stop colors/positions back into original formation
        for (var i = 0, l = stops.length; i < l; ++i) {
          stops[i][0] = +new color.RGBAColor(
            values[prop + 'Stop_' + i + 'r'],
            values[prop + 'Stop_' + i + 'g'],
            values[prop + 'Stop_' + i + 'b'],
            values[prop + 'Stop_' + i + 'a']
          );
          stops[i][1] = values[prop + 'Stop_' + i + '_pos'];
          delete values[prop + 'Stop_' + i + 'r'],
          delete values[prop + 'Stop_' + i + 'g'],
          delete values[prop + 'Stop_' + i + 'b'],
          delete values[prop + 'Stop_' + i + 'a'];
          delete values[prop + 'Stop_' + i + '_pos'];
        }

        values[prop] = this[prop];
      }
    };
  }

  return {
    fillGradient: translation('fillGradient'),
    strokeGradient: translation('strokeGradient')
  };
});
