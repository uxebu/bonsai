define([
  'bdd',
  'expect',
  'bonsai/util/unit'
], function(bdd, expect, unit) {
  'use strict';

  var describe = bdd.describe, it = bdd.it;

  describe('parseAngle', function() {
    var PI = Math.PI;
    var parseAngle = unit.parseAngle;

    it('calculates radians for degrees', function() {
      expect(parseAngle('45deg'))
        .to.be.closeTo(PI / 4, 1e-12);
    });

    it('calculates radians for turns', function() {
      expect(parseAngle('1.2turn'))
        .to.be.closeTo(2.4 * PI, 1e-12);
    });

    it('calculates radians for gradians', function () {
      expect(parseAngle('-32grad'))
        .to.be.closeTo(-32/200 * PI, 1e-12);
    });

    it('calculates radians for radians (string)', function () {
      var angle = -0.5026548245743669;
      expect(parseAngle(angle + 'rad'))
        .to.be.closeTo(angle, 1e-12);
    });

    it('passes through numbers', function () {
      var angle = -0.5026548245743669;
      expect(parseAngle(angle))
        .to.equal(angle);
    });
  });
});
