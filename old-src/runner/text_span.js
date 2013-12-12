define([
  './display_object',
  '../color',
  './gradient',
  '../tools'
], function(DisplayObject, color, gradient, tools) {
  'use strict';

  var accessor = tools.descriptorAccessor,
      data = tools.descriptorData,
      getter = tools.getter,
      parseColor = color.parse;

  // Getters and setters stolen from shape.js

  function getTextFillColor() {
    return this._textFillColor; // return color instance
  }
  function setTextFillColor(fill) {
    this._textFillColor = parseColor(fill, this._textFillColor);
  }

  function getTextFillGradient() {
    return this._textFillGradient;
  }
  function setTextFillGradient(grad) {
    if (grad) {
      this._textFillGradient = gradient(grad);
    }
  }

  function getFontFamily() {
    return this._fontFamily;
  }
  function setFontFamily(fontFamily) {
    this._fontFamily = fontFamily ? fontFamily.fontId || fontFamily : null;
  }

  function getGlyphx() {
    return this._glyphx;
  }
  function setGlyphx(glyphx) {
    if (tools.isArray(glyphx)) {
      this._glyphx = glyphx;
    }
    if (!glyphx) {
      this._glyphx = null;
    }
  }

  function getGlyphy() {
    return this._glyphy;
  }
  function setGlyphy(glyphy) {
    if (tools.isArray(glyphy)) {
      this._glyphy = glyphy;
    }
    if (!glyphy) {
      this._glyphy = null;
    }
  }

  var getTextStrokeColor = getter('_textStrokeColor');
  function setTextStrokeColor(color) {
    this._textStrokeColor = parseColor(color, this._textStrokeColor);
  }

  /**
   * The TextSpan constructor
   *
   * @constructor
   * @name TextSpan
   * @extends DisplayObject
   * @param {String} text The text content
   *
   * @property {__list__} __supportedAttributes__ List of supported attribute names.
   *    In addition to the property names listed for DisplayObject,
   *    these are the attribute names you can pass to the attr() method. Note
   *    that this property is not available in your code, it's just here for
   *    documentation purposes.
   * @property {string} __supportedAttributes__.text The text content.
   * @property {number} __supportedAttributes__.fontSize The font size. Default: 16
   * @property {string} __supportedAttributes__.fontFamily The font family Default: 'monospace'
   * @property {string} __supportedAttributes__.fontStyle The font style. Can be one of 'normal' or 'italic'. Default: 'normal'
   * @property {string} __supportedAttributes__.fontWeight The font weight. Can be one of 'normal' or 'bold'. Default: 'normal'
   * @property {string} __supportedAttributes__.glyphx An array of x offsets mapped to each individual glyph position
   * @property {string} __supportedAttributes__.glyphy An array of y offsets mapped to each individual glyph position
   * @property {string} __supportedAttributes__.cap The shape to be used at the end of open Path items, when they have a stroke. Can be one of 'round', 'square', 'butt'. Default: 'butt'
   * @property {string} __supportedAttributes__.textFillColor The fill color. Default: black.
   * @property {string} __supportedAttributes__.join The shape to be used at the corners of paths. Can be one of 'miter', 'round', 'bevel'. Default: 'miter'
   * @property {string} __supportedAttributes__.textStrokeColor The line color. Default: transparent
   * @property {number} __supportedAttributes__.textStrokeWidth The line width. Default: 0
   * @property {number} __supportedAttributes__.miterLimit The miter limit of the stroke. Default: 4
   * @property {number} __supportedAttributes__.selectable Boolean indicates whether the text is selectable or not
   *
   */
  function TextSpan(text) {

    DisplayObject.call(this);

    text = String(text);

    Object.defineProperties(this._attributes, {
      // many are null: default to null to inherit from Text parent
      text: data('', true, true),
      fontSize: data(null, true, true),
      fontFamily: accessor(getFontFamily, setFontFamily, true),
      _fontFamily: data(null, true),
      fontStyle: data(null, true, true),
      fontWeight: data(null, true, true),
      _textFillColor: data(null, true),
      textFillColor: accessor(getTextFillColor, setTextFillColor, true),
      _textFillGradient: data(null, true),
      textFillGradient: accessor(getTextFillGradient, setTextFillGradient, true),
      textFillOpacity: data(1, true, true),
      _glyphx: data(null, true),
      _glyphy: data(null, true),
      glyphx: accessor(getGlyphx, setGlyphx, true),
      glyphy: accessor(getGlyphy, setGlyphy, true),
      textLineOpacity: data(1, true, true),
      _textStrokeColor: data(null, true), // black by default
      textStrokeColor: accessor(getTextStrokeColor, setTextStrokeColor, true),
      textStrokeWidth: data(null, true, true),
      selectable: data(true, true, true)
    });

    this._renderAttributes = {
      // Set new render-attributes
      // Only font-related/presentational
      fontSize: 'fontSize',
      fontFamily: '_fontFamily',
      fontStyle: 'fontStyle',
      fontWeight: 'fontWeight',
      fillColor: '_textFillColor',
      fillGradient: '_textFillGradient',
      fillOpacity: 'textFillOpacity',
      filters: '_filters',
      glyphx: '_glyphx',
      glyphy: '_glyphy',
      strokeOpacity: 'textLineOpacity',
      strokeColor: '_textStrokeColor',
      strokeWidth: 'textStrokeWidth',
      opacity: '_opacity',
      text: 'text',
      selectable: 'selectable'
    };

    if (text != null) {
      this.attr('text', text);
    }
  }

  var proto = TextSpan.prototype = Object.create(DisplayObject.prototype);

  proto.type = 'TextSpan';

  proto.setText = function(text) {
    return this.attr('text', text);
  };

  proto.getText = function(text) {
    return this.attr('text');
  };

  return TextSpan;
});
