define([
  './group',
  './text_span',
  '../color',
  './gradient',
  '../tools'
], function(Group, TextSpan, color, gradient, tools) {
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

  var getTextStrokeColor = getter('_textStrokeColor');
  function setTextStrokeColor(color) {
    this._textStrokeColor = parseColor(color, this._textStrokeColor);
  }

  var getCap = getter('_cap');
  function setCap(cap) {
    if (cap === 'butt' || cap === 'round' || cap === 'square') {
      this._cap = '' + cap;
    }
  }

  var getJoin = getter('_join');
  function setJoin(join) {
    if (join === 'miter' || join === 'round' || join === 'bevel') {
      this._join = '' + join;
    }
  }

  var getMiterLimit = getter('_miterLimit');
  function setMiterLimit(miterLimit) {
    if (miterLimit >= 1) {
      this._miterLimit = +miterLimit;
    }
  }

  function setText(text) {
    this._owner.clear();
    this._owner.addChild(new TextSpan(text));
  }

  function getText() {
    var children = this._owner.children(),
        text = [];
    for (var i = 0, l = children.length; i < l; ++i) {
      text.push(children[i].attr('text'));
    }
    return text.join('');
  }

  /**
   * The Text constructor
   *
   * @constructor
   * @name Text
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
   * @property {string} __supportedAttributes__.fill The fill color. Default: black.
   * @property {string} __supportedAttributes__.join The shape to be used at the corners of paths. Can be one of 'miter', 'round', 'bevel'. Default: 'miter'
   * @property {string} __supportedAttributes__.line The line color. Default: transparent
   * @property {number} __supportedAttributes__.textStrokeWidth The line width. Default: 0
   * @property {number} __supportedAttributes__.miterLimit The miter limit of the stroke. Default: 4
   * @property {number} __supportedAttributes__.selectable Boolean indicates whether the text is selectable or not
   *
   */
  function Text(text) {
    Group.call(this);

    Object.defineProperties(this._attributes, {
      fontSize: data(16, true, true),
      fontFamily: accessor(getFontFamily, setFontFamily, true),
      _fontFamily: data('monospace', true),
      fontStyle: data('normal', true, true),
      fontWeight: data('normal', true, true),
      _cap: data('butt', true),
      cap: accessor(getCap, setCap, true),
      _textFillColor: data(0x000000ff, true), // transparent by default
      textFillColor: accessor(getTextFillColor, setTextFillColor, true),
      _textFillGradient: data(null, true),
      textFillGradient: accessor(getTextFillGradient, setTextFillGradient, true),
      textFillOpacity: data(1, true, true),
      textLineOpacity: data(1, true, true),
      _join: data('miter', true),
      join: accessor(getJoin, setJoin, true),
      _textStrokeColor: data(0x000000ff, true), // black by default
      textStrokeColor: accessor(getTextStrokeColor, setTextStrokeColor, true),
      textStrokeWidth: data(0, true, true),
      _miterLimit: data(4, true),
      miterLimit: accessor(getMiterLimit, setMiterLimit, true),
      text: accessor(getText, setText, true),
      textOrigin: data('top', true, true),
      selectable: data(true, true, true)
    });

    var rendererAttributes = this._renderAttributes;
    rendererAttributes.fontSize = 'fontSize';
    rendererAttributes.fontFamily = '_fontFamily';
    rendererAttributes.fontStyle = 'fontStyle';
    rendererAttributes.fontWeight = 'fontWeight';
    rendererAttributes.cap = '_cap';
    rendererAttributes.fillColor = '_textFillColor';
    rendererAttributes.strokeColor = '_textStrokeColor';
    rendererAttributes.fillGradient = '_textFillGradient';
    rendererAttributes.fillOpacity = 'textFillOpacity';
    rendererAttributes.strokeOpacity = 'textLineOpacity';
    rendererAttributes.join = '_join';
    rendererAttributes.strokeWidth = 'textStrokeWidth';
    rendererAttributes.miterLimit = '_miterLimit';
    rendererAttributes.selectable = 'selectable';
    rendererAttributes.textOrigin = 'textOrigin';

    if (text != null) {
      this.attr('text', text);
    }
  }

  var superObject = Group.prototype;
  var proto = Text.prototype = Object.create(superObject);

  /**
   * Adds a TextSpan child at the end list of contained TextSpans.
   *
   * If an index is given, the child is inserted at that index, moving
   * array items at that index and onwards one along. If the child is
   * inserted at a different point (different parent and/or index), it
   * is removed first.
   *
   * @param {TextSpan} child The TextSpan to add
   * @param {number} [index] The index for the child in the DisplayList
   * @returns {this} This instance
   */
  proto.addChild = function(child, index) {
    var isTextSpan =
      tools.isArray(child) ?
        child.every(function(child) {
          return child instanceof TextSpan;
        }) :
        child instanceof TextSpan;
    if (!(isTextSpan)) {
      throw TypeError('child is not a TextSpan instance/an array of TextSpans');
    }

    return superObject.addChild.apply(this, arguments);
  };

  proto.type = 'Text';

  proto.setText = function(text) {
    return this.attr('text', text);
  };

  proto.getText = function(text) {
    return this.attr('text');
  };

  return Text;
});
