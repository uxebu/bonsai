define([
  'bonsai/runner/path/star'
], function(Star) {

  describe('Star', function() {
    // Actual numbers are /*commented out*/ and we round numbers to 3 decimal points
    // (using `roundPathSegments` to avoid JS floating-point issues when comparing
    // expectation with actual result
    it('Creates and mutates a star', function() {
      var s = new Star(0, 0, 100, 4, 2);
      expect(roundPathSegments(s.segments())).toEqual([
        [ 'moveTo', 0, -100 ],
        [ 'lineTo', 100, -100 ],
        [ 'lineTo', 100, 0/*-6.123031769111886e-15*/ ],
        [ 'lineTo', 100, 100 ],
        [ 'lineTo', 0/*1.2246063538223773e-14*/, 100 ],
        [ 'lineTo', -100/*-99.99999999999999*/, 100 ],
        [ 'lineTo', -100, 0/*1.836909530733566e-14*/ ],
        [ 'lineTo', -100, -100/*-99.99999999999999*/ ],
        [ 'closePath' ]
      ]);
      s.attr('factor', 3);
      expect(roundPathSegments(s.segments())).toEqual([
        [ 'moveTo', 0, -100 ],
        [ 'lineTo', 150, -150 ],
        [ 'lineTo', 100, 0/*-6.123031769111886e-15*/ ],
        [ 'lineTo', 150/*150.00000000000003*/, 150 ],
        [ 'lineTo', 0/*1.2246063538223773e-14*/, 100 ],
        [ 'lineTo', -150/*-149.99999999999997*/, 150/*150.00000000000003*/ ],
        [ 'lineTo', -100, 0/*1.836909530733566e-14*/ ],
        [ 'lineTo', -150, -150/*-149.99999999999997*/ ],
        [ 'closePath' ]
      ]);
    });
  });

});
