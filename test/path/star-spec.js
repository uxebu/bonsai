require([
  'bonsai/runner/path/star',
  './runner.js'
], function(Star) {

  describe('Star', function() {
    it('Creates and mutates a star', function() {
      var s = new Star(0, 0, 100, 4, 2);
      expect(s.segments()).toEqual([
        [ 'moveTo', 0, -100 ],
        [ 'lineTo', 100, -100 ],
        [ 'lineTo', 100, -6.123031769111886e-15 ],
        [ 'lineTo', 100.00000000000001, 100 ],
        [ 'lineTo', 1.2246063538223773e-14, 100 ],
        [ 'lineTo', -99.99999999999999, 100.00000000000001 ],
        [ 'lineTo', -100, 1.836909530733566e-14 ],
        [ 'lineTo', -100, -99.99999999999999 ],
        [ 'closePath' ]
      ]);
      s.attr('factor', 3);
      expect(s.segments()).toEqual([
        [ 'moveTo', 0, -100 ],
        [ 'lineTo', 150, -150 ],
        [ 'lineTo', 100, -6.123031769111886e-15 ],
        [ 'lineTo', 150.00000000000003, 150 ],
        [ 'lineTo', 1.2246063538223773e-14, 100 ],
        [ 'lineTo', -149.99999999999997, 150.00000000000003 ],
        [ 'lineTo', -100, 1.836909530733566e-14 ],
        [ 'lineTo', -150, -149.99999999999997 ],
        [ 'closePath' ]
      ]);
    });
  });

});
