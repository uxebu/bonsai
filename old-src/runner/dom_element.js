/**
 * This module contains the DOMElement class.
 *
 * @exports DOMElement
 * @requires module:Group
 */

define(['./group', '../tools'], function(Group, tools) {

  'use strict';

  var CSS_PREFIX = 'css_',
      DOM_PREFIX = 'dom_';

  function DOMElement(nodeName, domAttributes, cssStyles) {

    Group.call(this);

    this.nodeName = nodeName || '';
    this._domAttributes = {};
    this._cssStyles = {};
    this._mutatedDomAttributes = {};
    this._mutatedCssStyles = {};

    this.type = 'DOMElement';

    this.setStyles(cssStyles);
    this.setAttributes(domAttributes);

    this.on('removedFromStage', function() {
      // Reset mutated attributes so that `composeRenderMessage` sends
      // *all* attributes next time (because element was removed):
      this._mutatedDomAttributes = tools.mixin({}, this._domAttributes);
      this._mutatedCssStyles = tools.mixin({}, this._cssStyles);
    });
  }

  var proto = DOMElement.prototype = Object.create(Group.prototype);

  proto.getAttribute = function(key) {
    return this._domAttributes[key];
  };

  proto.getStyle = function(key) {
    return this._cssStyles[key];
  };

  proto.setAttribute = function(key, value) {
    this._domAttributes[key] = value;
    this._mutatedDomAttributes[key] = true;
    this.markUpdate();
    return this;
  };

  proto.setAttributes = function(attributes) {
    for (var i in attributes) {
      this.setAttribute(i, attributes[i]);
    }
    return this;
  };

  proto.setStyles = function(css) {
    for (var i in css) {
      this.setStyle(i, css[i]);
    }
    return this;
  };

  proto.setStyle = function(key, value) {
    this._cssStyles[key] = value;
    this._mutatedCssStyles[key] = true;
    this.markUpdate();
    return this;
  };

  proto.composeRenderMessage = function(message) {
    message = Group.prototype.composeRenderMessage.call(this, message);

    var key,
        attributes = message.attributes,
        cssStyles = this._cssStyles,
        domAttributes = this._domAttributes,
        mutatedDomAttributes = this._mutatedDomAttributes,
        mutatedCssStyles = this._mutatedCssStyles;

    attributes.nodeName = this.nodeName;

    for (key in mutatedDomAttributes) {
      attributes[DOM_PREFIX + key] = domAttributes[key];
    }
    for (key in mutatedCssStyles) {
      attributes[CSS_PREFIX + key] = cssStyles[key];
    }

    this._mutatedCssStyles = {};
    this._mutatedDomAttributes = {};

    return {
      id: this.id,
      attributes: attributes,
      data: this._getRenderData && this._getRenderData(),
      type: this.type,
      offStageType: this._offStageType
    };
  };

  return DOMElement;
});
