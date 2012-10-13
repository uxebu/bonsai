define([
  'bonsai/runner/animation/properties_tween'
], function(PropertiesTween) {

  describe('PropertiesTween', function() {

    describe('at()', function() {
      it('Should return the current set of values as an object', function() {
        var t = new PropertiesTween({
          a: 10,
          b: 0
        }, {
          a: 20,
          b: 20
        });
        expect(t.at(0)).toEqual({
          a: 10,
          b: 0
        });
        expect(t.at(1)).toEqual({
          a: 20,
          b: 20
        });
        expect(t.at(0.5)).toEqual({
          a: 15,
          b: 10
        });
        expect(t.at(0.509)).toEqual({
          a: 15.09,
          b: 10.18
        });
      });
      it('Should apply translations', function() {
        PropertiesTween.propertyTranslators.fooColor = {
          toNumeric: function(colorObj) {
            return [colorObj.r, colorObj.g, colorObj.b];
          },
          toAttr: function(numericVals) {
            return {
              r: ~~numericVals[0],
              g: ~~numericVals[1],
              b: ~~numericVals[2]
            };
          }
        };
        var t = new PropertiesTween({
          fooColor: {r:0, g:100, b:255}
        }, {
          fooColor: {r:20, g:100, b:0}
        });
        expect(t.at(0)).toEqual({
          fooColor: {r:0, g:100, b:255}
        });
        expect(t.at(0.5)).toEqual({
          fooColor: {r:10, g:100, b:127}
        });
      });
    });

  });

});