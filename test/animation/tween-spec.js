define([
  'bonsai/runner/animation/tween'
], function(Tween) {

  describe('Tween', function() {
    describe('Without translator', function() {
      it('Should calculate value based on progress', function() {
        var t = new Tween(0, 2000);
        expect(t.at(.5)).toBe(1000);
        expect(t.at(.95)).toBe(1900);
        expect(t.at(.23423)).toBe(468.46);
      });
    });
    describe('With translator', function() {
      it('Should delegate to translator before returning result from at()', function() {
        var t = new Tween('foo:0', 'foo:120', {
          toUnique: function(val) {
            return 'foo:' + val;
          },
          toNumber: function(val) {
            return +val.split(':')[1];
          }
        });
        expect(t.at(0)).toBe('foo:0');
        expect(t.at(0.5)).toBe('foo:60');
        expect(t.at(1)).toBe('foo:120');
      });
    });
  });

});