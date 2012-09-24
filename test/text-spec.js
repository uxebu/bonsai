define([
  'bonsai/runner/text',
  'bonsai/runner/text_span'
], function(Text, TextSpan) {

  describe('Text API', function() {

    describe('Text', function() {

      it('set text via constructor and get text', function() {
        var ex = 'myTest', t = new Text(ex);
        expect(t.attr('text')).toBe(ex);
      });

      it('Allows falsey non-null text', function() {
        expect(new Text(0).attr('text')).toBe('0');
        expect(new Text(false).attr('text')).toBe('false');
      });

      it('Expect default textOrigin to be "top"', function() {
        expect(new Text('').attr('textOrigin')).toBe('top');
      });

      it('sets text via attr() and get text', function() {
        var ex = 'myTest', t = new Text('').attr('text', ex);
        expect(t.attr('text')).toBe(ex);
      });

      it('can get text from child objects', function() {
        var t = new Text(''),
            s = new TextSpan('a');
        s.addTo(t);
        expect(t.attr('text')).toBe('a');
      });

      it('behaves correctly with adding/removing children via overwrites', function() {
        var t = new Text(''),
            a = new TextSpan('foo'),
            b = new TextSpan(123);
        t.addChild([a, b]);
        expect(t.attr('text')).toBe('foo123');
        t.attr('text', 'bar');
        expect(t.attr('text')).toBe('bar');
        expect(t.children().length).toBe(1);
      });

      it('sets text via setText() and get text via getText()', function() {
        var ex = 'myTest', t = new Text('').setText(ex);
        expect(t.getText()).toBe(ex);
      });

      it('allows getting/setting of selectable attribute', function() {
        var t = new Text();
        expect(t.attr('selectable')).toBe(true);
        t.attr('selectable', false);
        expect(t.attr('selectable')).toBe(false);
      });

      describe('provides a property to change `textFillColor`', function() {
        it('is set to `black` by default', function() {
          expect(new Text('').attr('textFillColor')).toBe(255);
        });
        it('returns `red` when set to `red`.', function() {
          expect(new Text('').attr('textFillColor', 'red').attr('textFillColor')).toBe(4278190335);
        });
      });

      describe('provides a property to change `textFillOpacity`', function() {
        it('is set to `1` by default', function() {
          expect(new Text('').attr('textFillOpacity')).toBe(1);
        });
        it('returns `0.1` when set to `0.1`', function() {
          expect(new Text('').attr('textFillOpacity', 0.1).attr('textFillOpacity')).toBe(0.1);
        });
        it('returns `1234` when set to `1234` (means no validation atm, valid range is 0-1)', function() {
          expect(new Text('').attr('textFillOpacity', 1234).attr('textFillOpacity')).toBe(1234);
        });
      });

      describe('provides a property to change `textStrokeColor`', function() {
        it('is set to `black` by default', function() {
          expect(new Text('').attr('textStrokeColor')).toBe(255);
        });
        it('returns `red` when set to `red`.', function() {
          expect(new Text('').attr('textStrokeColor', 'red').attr('textStrokeColor')).toBe(4278190335);
        });
      });

      describe('provides a property to change `textFillGradient`', function() {
        it('is set to `black` by default', function() {
          expect(new Text('').attr('textFillGradient')).toBe(null);
        });
        /*
         TODO: find out why I'm not able to mock `bonsai.gradient`
         it('returns `aGradient` when set to `aGradient`', function() {
         spyOn(bonsai, 'gradient').andReturn('aGradient');
         expect(new Text('').attr('textFillGradient', 'aGradient').attr('textFillGradient')).toEqual('aGradient');
         });
         */
      });

      describe('provides a property to change `textStrokeWidth`', function() {
        it('is set to `0` by default', function() {
          expect(new Text('').attr('textStrokeWidth')).toBe(0);
        });
        it('returns `5` when set to `5`.', function() {
          expect(new Text('').attr('textStrokeWidth', 5).attr('textStrokeWidth')).toBe(5);
        });
      });

      describe('provides a property to change `textLineOpacity`', function() {
        it('is set to `1` by default', function() {
          expect(new Text('').attr('textLineOpacity')).toBe(1);
        });
        it('returns `0.1` when set to `0.1`.', function() {
          expect(new Text('').attr('textLineOpacity', 0.1).attr('textLineOpacity')).toBe(0.1);
        });
        it('returns `1234` when set to `1234` (means no validation atm, valid range is 0-1)', function() {
          expect(new Text('').attr('textLineOpacity', 1234).attr('textLineOpacity')).toBe(1234);
        });
      });

    });

    describe('TextSpan', function() {

      it('set text via constructor and get text', function() {
        var ex = 'myTest', t = new TextSpan(ex);
        expect(t.attr('text')).toBe(ex);
      });

      it('Allows falsey non-null text', function() {
        expect(new TextSpan(0).attr('text')).toBe('0');
        expect(new TextSpan(false).attr('text')).toBe('false');
      });

      it('Has a default strokeWidth of null, so it is not rendered', function() {
        expect(new TextSpan('...').attr('textStrokeWidth')).toBe(null);
      });

      it('sets text via attr() and get text', function() {
        var ex = 'myTest', t = new TextSpan('').attr('text', ex);
        expect(t.attr('text')).toBe(ex);
      });

      it('sets text via setText() and get text via getText()', function() {
        var ex = 'myTest', t = new TextSpan('').setText(ex);
        expect(t.getText()).toBe(ex);
      });

      it('allows getting/setting of glyphx/glyphy properties', function() {
        var t = new TextSpan('...');
        expect(t.attr('glyphx')).toBe(null);
        expect(t.attr('glyphy')).toBe(null);
        t.attr('glyphx', [11,22,33,44]);
        expect(t.attr('glyphx')).toEqual([11,22,33,44]);
        expect(t.attr('glyphy')).toBe(null);
        t.attr('glyphy', [11,22,33,44]);
        expect(t.attr('glyphx')).toEqual([11,22,33,44]);
        expect(t.attr('glyphy')).toEqual([11,22,33,44]);
        t.attr('glyphx', null);
        t.attr('glyphy', null);
        expect(t.attr('glyphx')).toBe(null);
        expect(t.attr('glyphy')).toBe(null);
      });

      it('allows getting/setting of selectable attribute', function() {
        var t = new TextSpan();
        expect(t.attr('selectable')).toBe(true);
        t.attr('selectable', false);
        expect(t.attr('selectable')).toBe(false);
      });
    });

  });

});
