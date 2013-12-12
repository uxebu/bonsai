define([
  'bonsai/color'
], function(color) {window.color = color;

  function toRGBA(c) {
    var rgbaColor = color(c);
    if (rgbaColor === null) {
      return null;
    }
    rgbaColor.alpha(
      Math.round(rgbaColor.alpha() * 10) / 10 // round it to 1 dec place
    );
    return rgbaColor.rgba();
  }

  describe('color', function() {

    it('Returns an RGBAColor instance', function() {
      expect(color('red')).toBeInstanceOf(color.RGBAColor);
      expect(color('#F00')).toBeInstanceOf(color.RGBAColor);
    });

    it('Returns null when an invalid format is passed', function() {
      var black = 'rgba(0,0,0,1)';
      expect(toRGBA()).toBe(null);
      expect(toRGBA('jf2324d')).toBe(null);
      expect(toRGBA('rgb(0)')).toBe(null);
    });

    describe('parse', function() {

      it('Can handle #-------- (alpha incl.)', function() {
        expect(toRGBA('#FFFFFFFF')).toBe('rgba(255,255,255,1)');
        expect(toRGBA('#FfFffF00')).toBe('rgba(255,255,255,0)');
        expect(toRGBA('#FF000034')).toBe('rgba(255,0,0,0.2)');
        expect(toRGBA('#00FF00FF')).toBe('rgba(0,255,0,1)');
        expect(toRGBA('#0000FF99')).toBe('rgba(0,0,255,0.6)');
        expect(toRGBA('#00000000')).toBe('rgba(0,0,0,0)');
        expect(toRGBA('#ccAABbFF')).toBe('rgba(204,170,187,1)');
        expect(toRGBA('#34856CFF')).toBe('rgba(52,133,108,1)');
      });

      it('Can handle #------', function() {
        expect(toRGBA('#FFFFFF')).toBe('rgba(255,255,255,1)');
        expect(toRGBA('#FfFffF')).toBe('rgba(255,255,255,1)');
        expect(toRGBA('#FF0000')).toBe('rgba(255,0,0,1)');
        expect(toRGBA('#00FF00')).toBe('rgba(0,255,0,1)');
        expect(toRGBA('#0000FF')).toBe('rgba(0,0,255,1)');
        expect(toRGBA('#000000')).toBe('rgba(0,0,0,1)');
        expect(toRGBA('#ccAABb')).toBe('rgba(204,170,187,1)');
        expect(toRGBA('#34856C')).toBe('rgba(52,133,108,1)');
      });

      it('Can handle #---', function() {
        expect(toRGBA('#FFF')).toBe('rgba(255,255,255,1)');
        expect(toRGBA('#ffF')).toBe('rgba(255,255,255,1)');
        expect(toRGBA('#f00')).toBe('rgba(255,0,0,1)');
        expect(toRGBA('#0F0')).toBe('rgba(0,255,0,1)');
        expect(toRGBA('#00F')).toBe('rgba(0,0,255,1)');
        expect(toRGBA('#000')).toBe('rgba(0,0,0,1)');
        expect(toRGBA('#cAb')).toBe('rgba(204,170,187,1)');
        expect(toRGBA('#aFA')).toBe('rgba(170,255,170,1)');
      });

      it('Can handle rgb()', function() {
        expect(toRGBA('rgb(255,255,255)')).toBe('rgba(255,255,255,1)');
        expect(toRGBA('rgb(255,0,0)')).toBe('rgba(255,0,0,1)');
        expect(toRGBA('rgb(0,255,0)')).toBe('rgba(0,255,0,1)');
        expect(toRGBA('rgb(0,0,255)')).toBe('rgba(0,0,255,1)');
        expect(toRGBA('rgb(0,0,0)')).toBe('rgba(0,0,0,1)');
        expect(toRGBA('rgb(204,170,187)')).toBe('rgba(204,170,187,1)');
        expect(toRGBA('rgb(170,255,170)')).toBe('rgba(170,255,170,1)');
        expect(toRGBA('rgb(1,99,233)')).toBe('rgba(1,99,233,1)');
        expect(toRGBA('rgb(1, 99, 233)')).toBe('rgba(1,99,233,1)');
        expect(toRGBA('rgb(1,  99,  233)')).toBe('rgba(1,99,233,1)');
      });

      it('Can handle rgba()', function() {
        expect(toRGBA('rgba(255,255,255,1)')).toBe('rgba(255,255,255,1)');
        expect(toRGBA('rgba(255,0,0,0)')).toBe('rgba(255,0,0,0)');
        expect(toRGBA('rgba(0,255,0,0.3)')).toBe('rgba(0,255,0,0.3)');
        expect(toRGBA('rgba(0,0,255,1)')).toBe('rgba(0,0,255,1)');
        expect(toRGBA('rgba(0,0,0,1)')).toBe('rgba(0,0,0,1)');
        expect(toRGBA('rgba(204,170,187,0.7)')).toBe('rgba(204,170,187,0.7)');
        expect(toRGBA('rgba(170,255,170,1)')).toBe('rgba(170,255,170,1)');
        expect(toRGBA('rgba(1,99,233,0)')).toBe('rgba(1,99,233,0)');
        expect(toRGBA('rgba(1, 99, 233, 0)')).toBe('rgba(1,99,233,0)');
        expect(toRGBA('rgba(1, 99,  233,   0)')).toBe('rgba(1,99,233,0)');
        // Forces bounds of 0..1 for alpha:
        expect(toRGBA('rgba(1,2,3,4444)')).toBe('rgba(1,2,3,1)');
        expect(toRGBA('rgba(1,2,3,255)')).toBe('rgba(1,2,3,1)');
        expect(toRGBA('rgba(1,2,3,-1)')).toBe('rgba(1,2,3,0)');
        expect(toRGBA('rgba(1,2,3,1.101)')).toBe('rgba(1,2,3,1)');
      });

      it('Can handle hsl()', function() {
        expect(toRGBA('hsl(0,0%,100%)')).toBe('rgba(255,255,255,1)');
        expect(toRGBA('hsl(99,55%,100%)')).toBe('rgba(255,255,255,1)');
        expect(toRGBA('hsl(0,100%,50%)')).toBe('rgba(255,0,0,1)');
        expect(toRGBA('hsl(20,10%,50%)')).toBe('rgba(140,123,115,1)');
        expect(toRGBA('hsl(20, 10%, 50%)')).toBe('rgba(140,123,115,1)');
        expect(toRGBA('hsl(20,  10%,  50%)')).toBe('rgba(140,123,115,1)');
        expect(toRGBA('hsl(0, 90%, 57%)')).toBe('rgba(244,47,47,1)');
        expect(toRGBA('hsl(51, 90%, 57%)')).toBe('rgba(244,214,47,1)');
        expect(toRGBA('hsl(102, 90%, 57%)')).toBe('rgba(106,244,47,1)');
        expect(toRGBA('hsl(154, 90%, 57%)')).toBe('rgba(47,244,159,1)');
        expect(toRGBA('hsl(205, 90%, 57%)')).toBe('rgba(47,162,244,1)');
        expect(toRGBA('hsl(257, 90%, 57%)')).toBe('rgba(103,47,244,1)');
        expect(toRGBA('hsl(308, 90%, 57%)')).toBe('rgba(244,47,218,1)');
        expect(toRGBA('hsl(0, 100%, 50%)')).toBe('rgba(255,0,0,1)');
        expect(toRGBA('hsl(51, 100%, 50%)')).toBe('rgba(255,217,0,1)');
        expect(toRGBA('hsl(102,100%,50%)')).toBe('rgba(76,255,0,1)');
        expect(toRGBA('hsl(154,100%,50%)')).toBe('rgba(0,255,145,1)');
        expect(toRGBA('hsl(205,100%,50%)')).toBe('rgba(0,149,255,1)');
        expect(toRGBA('hsl(257,100%,50%)')).toBe('rgba(72,0,255,1)');
        expect(toRGBA('hsl(308,100%,50%)')).toBe('rgba(255,0,221,1)');
      });

      it('Can handle hsla()', function() {
        expect(toRGBA('hsla(0,0%,100%,0)')).toBe('rgba(255,255,255,0)');
        expect(toRGBA('hsla(99,55%,100%,0.3)')).toBe('rgba(255,255,255,0.3)');
        expect(toRGBA('hsla(0,100%,50%,0.1)')).toBe('rgba(255,0,0,0.1)');
        expect(toRGBA('hsla(20,10%,50%,1)')).toBe('rgba(140,123,115,1)');
        expect(toRGBA('hsla(20, 10%, 50%, 1)')).toBe('rgba(140,123,115,1)');
        expect(toRGBA('hsla(20, 10%,  50%,   1)')).toBe('rgba(140,123,115,1)');
      });

      it('Can handle color names', function() {
        expect(toRGBA('red')).toBe('rgba(255,0,0,1)');
        expect(toRGBA('green')).toBe('rgba(0,128,0,1)');
        expect(toRGBA('lime')).toBe('rgba(0,255,0,1)');
        expect(toRGBA('blue')).toBe('rgba(0,0,255,1)');
        expect(toRGBA('yellow')).toBe('rgba(255,255,0,1)');
        expect(toRGBA('white')).toBe('rgba(255,255,255,1)');
        expect(toRGBA('black')).toBe('rgba(0,0,0,1)');
      });

      it('Can handle 0x<rr><gg><bb><aa>', function() {
        expect(toRGBA('0xff0000ff')).toBe('rgba(255,0,0,1)');
        expect(toRGBA('0xff00ff')).toBe('rgba(0,255,0,1)');
        expect(toRGBA('0xaabbccff')).toBe('rgba(170,187,204,1)');
      });
    });
  });

  describe('color.RGBAColor', function() {

    it('Sets RGBA values via arguments', function() {
      var c = new color.RGBAColor(111,222,255,1);
      expect(c.r()).toBe(111);
      expect(c.g()).toBe(222);
      expect(c.b()).toBe(255);
      expect(c.a()).toBe(1);
    });

    it('Can be cloned', function() {
      var orig = new color.RGBAColor(255,100,50,1);
      var clone = orig.clone();
      expect(clone).toNotBe(orig);
      expect(clone.r()).toBe(orig.r());
      expect(clone.g()).toBe(orig.g());
      expect(clone.b()).toBe(orig.b());
      expect(clone.a()).toBe(orig.a());
      expect(clone.h()).toBe(orig.h());
      expect(clone.s()).toBe(orig.s());
      expect(clone.l()).toBe(orig.l());
      expect(clone.a()).toBe(orig.a());
      clone = orig.clone({
        hue: .3
      });
      expect(clone.hue()).toNotBe(orig.hue());
      expect(clone.a()).toBe(orig.a());
    });

    it('Returns numerical form 0x<rr><gg><bb><aa> when cast to Number', function() {
      expect(+new color.RGBAColor(255,255,0,1)).toBe(0xffff00ff);
      expect(+new color.RGBAColor(0,0,0,0)).toBe(0);
    });

    describe('red, green, blue', function(){
      it('is mutable', function() {
        expect(toRGBA(color('#FFF').set('r', 0))).toBe('rgba(0,255,255,1)');
        expect(toRGBA(color('#FFF').set('g', 0))).toBe('rgba(255,0,255,1)');
        expect(toRGBA(color('#FFF').set('b', 0))).toBe('rgba(255,255,0,1)');
        expect(toRGBA(color('#FFF').set('red', 0))).toBe('rgba(0,255,255,1)');
        expect(toRGBA(color('#FFF').set('green', 0))).toBe('rgba(255,0,255,1)');
        expect(toRGBA(color('#FFF').set('blue', 0))).toBe('rgba(255,255,0,1)');
        expect(toRGBA(
          color('#FFF')
            .set('red', 1)
            .set('green', 2)
            .set('blue', 3)
        )).toBe('rgba(1,2,3,1)');
      });
    });

    describe('hue', function() {

      it('is mutable', function(){
        expect(toRGBA(color('red').set('hue', .5))).toBe('rgba(0,255,255,1)');
        expect(toRGBA(color('red').set('hue', .75))).toBe('rgba(127,0,255,1)');
        expect(
          toRGBA(color('red').set('hue', .4))
        ).toBe(
          toRGBA('hsla(' + (0|.4*360) + ',100%,50%,1)')
        );
      });

    });

    describe('saturation', function() {

      it('is mutable', function(){
        expect(toRGBA(color('red').set('saturation', .66))).toBe('rgba(212,43,43,1)');
        expect(toRGBA(color('red').set('saturation', .50))).toBe('rgba(191,64,64,1)');
        expect(
          toRGBA(color('red').set('saturation', .44))
        ).toBe(
          toRGBA('hsla(0,44%,50%,1)')
        );
      });

    });

    describe('lightness', function() {

      it('is mutable', function(){
        expect(toRGBA(color('red').set('lightness', 0.3))).toBe('rgba(153,0,0,1)');
        expect(toRGBA(color('red').set('lightness', 0.99))).toBe('rgba(255,250,250,1)');
        expect(
          toRGBA(color('red').set('lightness', 0.22))
        ).toBe(
          toRGBA('hsla(0,100%,22%,1)')
        );
      });

    });

    describe('Color-spawning methods', function() {

      var precision = new Number(2);
      precision.PRECISION = +precision;

      describe('lighter', function() {
        expect(color('hsl(200,50%,50%)').lighter(0.1).l()).toBeCloseTo(0.6, precision);
        expect(color('hsl(100,10%,70%)').lighter(0.2).l()).toBeCloseTo(0.9, precision);
        expect(color('hsl(150,64%,95%)').lighter(-0.2).l()).toBeCloseTo(0.75, precision);
        expect(color('hsl(200,50%,50%)').lighter(0.6).l()).toBeCloseTo(1, precision);
        expect(color('hsl(200,50%,50%)').lighter(-0.6).l()).toBeCloseTo(0, precision);
      });

      describe('darker', function() {
        expect(color('hsl(200,50%,50%)').darker(0.1).l()).toBeCloseTo(0.4, precision);
        expect(color('hsl(100,10%,70%)').darker(0.2).l()).toBeCloseTo(0.5, precision);
        expect(color('hsl(150,64%,15%)').darker(-0.2).l()).toBeCloseTo(0.35, precision);
        expect(color('hsl(200,50%,50%)').darker(0.6).l()).toBeCloseTo(0, precision);
        expect(color('hsl(200,50%,50%)').darker(-0.6).l()).toBeCloseTo(1, precision);
      });

    });

    describe('_setPointAlongRange', function() {
      it('Returns point along range in color value', function() {
        expect(color('rgb(255,0,0)')._setPointAlongRange('r', .5, 100).r()).toBe(255);
        expect(color('rgb(100,0,0)')._setPointAlongRange('r', .3, 100).r()).toBe(80);
        expect(color('rgb(0,128,0)')._setPointAlongRange('g', 1, 20).g()).toBe(138);
        expect(color('rgb(0,0,0)')._setPointAlongRange('b', .78, 130).b()).toBe(36);
      });
    });

    describe('has a method `rgb`', function() {
      it('Returns a RGB String representation as specified by CSS', function() {
        expect(color('white').rgb()).toEqual('rgb(255,255,255)');
        expect(color('blue').rgb()).toEqual('rgb(0,0,255)');
        expect(color('black').rgb()).toEqual('rgb(0,0,0)');
      });
    });

    describe('has a method `setColorMatrix`', function() {
      it('is a function', function() {
        expect(typeof new color.RGBAColor().setColorMatrix).toBe('function');
      });
      it('yellow color remains yellow on identity matrix', function() {
        var identityMatrix = [
          1, 0, 0, 0, 0,
          0, 1, 0, 0, 0,
          0, 0, 1, 0, 0,
          0, 0, 0, 1, 0
        ];
        var expectedColor = color(4289003775).setColorMatrix(identityMatrix);
        expect(expectedColor._properties.r).toBe(255);
        expect(expectedColor._properties.g).toBe(165);
        expect(expectedColor._properties.b).toBe(0);
        expect(expectedColor._properties.a).toBe(1);
      });
      it('converts yellow to orange', function() {
        var toYellowMatrix = [
          1, 1, 1, 0, 0,
          1, 0.7, -1, 0, 0,
          -1, -1, -1, 0, 0,
          0, 0, 0, 1, 0
        ];
        var expectedColor = color('red').setColorMatrix(toYellowMatrix);
        expect(expectedColor._properties.r).toBe(255);
        expect(expectedColor._properties.g).toBe(255);
        expect(expectedColor._properties.b).toBe(0);
        expect(expectedColor._properties.a).toBe(1);
      });
      it('converts green to blue', function() {
        var toBlueMatrix = [
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 1, 0, 0, 0,
          0, 0, 0, 1, 0
        ];
        var expectedColor = color(8388863).setColorMatrix(toBlueMatrix);
        expect(expectedColor._properties.r).toBe(0);
        expect(expectedColor._properties.g).toBe(0);
        expect(expectedColor._properties.b).toBe(128);
        expect(expectedColor._properties.a).toBe(1);
      });
      it('converts dark green to soft green', function() {
        var toSoftGreenMatrix = [
          1, 0, 0, 0, -0.26953125,
          0, 1, 0, 0, 0.39453125,
          0, 0, 1, 0, 0.46484375,
          0, 0, 0, 1, 0
        ];
        var expectedColor = color('green').setColorMatrix(toSoftGreenMatrix);
        expect(expectedColor._properties.r).toBe(0);
        expect(expectedColor._properties.g).toBe(228.60546875);
        expect(expectedColor._properties.b).toBe(118.53515625);
        expect(expectedColor._properties.a).toBe(1);
      });
    });

  });

});
