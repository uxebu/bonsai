require([
  'bonsai/runner/path/polygon',
  './runner.js'
], function(Polygon) {

  describe('Polygon', function() {
    it('Creates and mutates a square polygon', function() {
      var s = new Polygon(0, 0, 100, 4);
      expect(s.segments()).toEqual([
        ['moveTo', 0, -100],
        ['lineTo', 100, -6.123031769111886e-15],
        ['lineTo', 1.2246063538223773e-14, 100 ],
        ['lineTo', -100, 1.836909530733566e-14],
        ['closePath']
      ]);
      s.attr('radius', 110);
      expect(s.segments()).toEqual([
        ['moveTo', 0, -110],
        ['lineTo', 110, -6.735334946023075e-15],
        ['lineTo', 1.347066989204615e-14, 110],
        ['lineTo', -110, 2.0206004838069225e-14],
        ['closePath']
      ]);
    });
    it('Creates and mutates an octagon', function() {
      var s = new Polygon(0, 0, 50, 8);
      expect(s.segments()).toEqual([
        ['moveTo', 0, -50 ],
        ['lineTo', 35.35533905932737, -35.35533905932738],
        ['lineTo', 50, -3.061515884555943e-15],
        ['lineTo', 35.35533905932738, 35.35533905932737],
        ['lineTo', 6.123031769111886e-15, 50],
        ['lineTo', -35.35533905932737, 35.355339059327385],
        ['lineTo', -50, 9.18454765366783e-15],
        ['lineTo', -35.355339059327385, -35.35533905932737],
        ['closePath']
      ]);
      s.attr('radius', 60);
      expect(s.segments()).toEqual([
        ['moveTo', 0, -60 ],
        ['lineTo', 42.426406871192846, -42.42640687119285],
        ['lineTo', 60, -3.673819061467132e-15],
        ['lineTo', 42.42640687119285, 42.426406871192846],
        ['lineTo', 7.347638122934264e-15, 60],
        ['lineTo', -42.426406871192846, 42.42640687119286],
        ['lineTo', -60, 1.1021457184401395e-14],
        ['lineTo', -42.42640687119286, -42.42640687119284],
        ['closePath']
      ]);
    });
  });

});
