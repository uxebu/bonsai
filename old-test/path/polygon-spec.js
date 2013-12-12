define([
  'bonsai/runner/path/polygon'
], function(Polygon) {

  describe('Polygon', function() {
    // Actual numbers are /*commented out*/ and we round numbers to 3 decimal points
    // (using `roundPathSegments` to avoid JS floating-point issues when comparing
    // expectation with actual result
    it('Creates and mutates a square polygon', function() {
      var s = new Polygon(0, 0, 100, 4);
      expect(roundPathSegments(s.segments())).toEqual([
        ['moveTo', 0, -100],
        ['lineTo', 100, 0/*-6.123031769111886e-15*/],
        ['lineTo', 0/*1.2246063538223773e-14*/, 100 ],
        ['lineTo', -100, 0/*1.836909530733566e-14*/],
        ['closePath']
      ]);
      s.attr('radius', 110);
      expect(roundPathSegments(s.segments())).toEqual([
        ['moveTo', 0, -110],
        ['lineTo', 110, 0/*-6.735334946023075e-15*/],
        ['lineTo', 0/*1.347066989204615e-14*/, 110],
        ['lineTo', -110, 0/*2.0206004838069225e-14*/],
        ['closePath']
      ]);
    });
    it('Creates and mutates an octagon', function() {
      var s = new Polygon(0, 0, 50, 8);
      expect(roundPathSegments(s.segments())).toEqual([
        ['moveTo', 0, -50 ],
        ['lineTo', 35.355/*35.35533905932737*/, -35.355/*-35.35533905932738*/],
        ['lineTo', 50, 0/*-3.061515884555943e-15*/],
        ['lineTo', 35.355/*35.35533905932738*/, 35.355/*35.35533905932737*/],
        ['lineTo', 0/*6.123031769111886e-15*/, 50],
        ['lineTo', -35.355/*-35.35533905932737*/, 35.355/*35.355339059327385*/],
        ['lineTo', -50, 0/*9.18454765366783e-15*/],
        ['lineTo', -35.355/*-35.355339059327385*/, -35.355/*-35.35533905932737*/],
        ['closePath']
      ]);
      s.attr('radius', 60);
      expect(roundPathSegments(s.segments())).toEqual([
        ['moveTo', 0, -60 ],
        ['lineTo', 42.426/*42.426406871192846*/, -42.426/*-42.42640687119285*/],
        ['lineTo', 60, 0/*-3.673819061467132e-15*/],
        ['lineTo', 42.426/*42.42640687119285*/, 42.426/*42.426406871192846*/],
        ['lineTo', 0/*7.347638122934264e-15*/, 60],
        ['lineTo', -42.426/*-42.426406871192846*/, 42.426/*42.42640687119286*/],
        ['lineTo', -60, 0/*1.1021457184401395e-14*/],
        ['lineTo', -42.426/*-42.42640687119286*/, -42.426/*-42.42640687119284*/],
        ['closePath']
      ]);
    });
  });

});
