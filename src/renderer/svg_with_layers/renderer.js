/**
 * A special Renderer for SVG.
 *
 * @requires module:renderer
 */
define([
  '../../event_emitter',
  '../../tools',
  '../../color',
  '../../segment_helper',
  './utils',

  './display_element',
  './display_group',
  './display_layer',
  './dom_element',
  './svg_element',
  './dom_layer',
  './svg_layer',

  './svg_filters',
  './svg_event_handlers',
  '../../asset/asset_controller'
], function(
  EventEmitter, tools, color, segmentHelper, utils,
  DisplayElement, DisplayGroup, DisplayLayer, DOMElement, SVGElement, DOMLayer, SVGLayer,
  svgFilters, eventHandlers, AssetController
) {
  'use strict';

  var isWebkitPatternBug = /Version\/5\.1(\.[0-4])? /.test(navigator.appVersion);

  // utils
  var cssClasses = utils.cssClasses,
      matrixToString = utils.matrixToString,
      gradientToSignature = utils.gradientToSignature,
      filterToSignature = utils.filterToSignature,
      valueFromSignatureForType = utils.valueFromSignatureForType,
      exportToPath = segmentHelper.exportToPath,
      createSVGElement = utils.createSVGElement;

  // svgFilters
  var isFEColorMatrixEnabled = svgFilters.isFEColorMatrixEnabled,
      colorApplyColorMatrix = svgFilters.colorApplyColorMatrix,
      filterElementsFromList = svgFilters.filterElementsFromList;

  // AssetController
  var fontIDs = AssetController.handlers.Font.fontIDs,
      fontPrefix = AssetController.handlers.Font.prefix;

  var basicAttributeMap = {
    cap: 'stroke-linecap',
    join: 'stroke-linejoin',
    miterLimit: 'stroke-miterlimit',
    opacity: 'opacity',
    fillOpacity: 'fill-opacity',
    strokeOpacity: 'stroke-opacity',
    fontSize: 'font-size',
    fontWeight: 'font-weight',
    fontStyle: 'font-style',
    textAnchor: 'text-anchor',
    text: 'text',
    cursor: 'cursor',
    fillRule: 'fill-rule'
  };

  var eventTypes = [
    'dblclick',
    'click',
    'mouseenter',
    'mouseleave',
    'mouseover',
    'mouseout',
    'mouseup',
    'mousedown',
    'touchstart',
    'touchend',
    'mousemove',
    'touchmove',
    'mousewheel'
  ];

  var xlink = 'http://www.w3.org/1999/xlink';

  function Display(node, width, height) {

    this.width = width;
    this.height = height;

    this.root = this[0] = new DisplayGroup(null, 0);
    this.root.dom.style.position = 'relative';
    this.svgResourcesLayer = this.root.getResourcesSVGLayer();
    this.svgResourcesDefs = this.svgResourcesLayer.defs;

    if (width) {
      this.root.dom.style.width = width + 'px';
    }
    if (height) {
      this.root.dom.style.height = height + 'px';
    }

    node.appendChild(this.root.dom);

  }

  Display.prototype = {

    attr: function(el, attributes, type) {

      var value;
      var dom = el.dom;

      for (var i in attributes) {

        value = attributes[i];

        if (type === 'Group' || type === 'Movie') {
          switch (i) {
            case 'opacity':
              dom.style.opacity = value;
              break;
            case 'origin':
              console.log('Setting origin');
              break;
          }
        } else if (i in basicAttributeMap) {
          if (value != null) {
            dom.setAttribute(basicAttributeMap[i], value);
          } else if (value === null) {
            dom.removeAttribute(basicAttributeMap[i]);
          }
          continue;
        }

        switch (i) {
          case 'fontFamily':
            value = fontIDs[value] || value;
            if (value != null) {
              dom.setAttribute('font-family', value);
            } else if (value === null) {
              dom.removeAttribute('font-family');
            }
            break;
          case 'strokeWidth':

            dom.setAttribute('stroke-width', value);
            if (value <= 0) {
              /*
                AFFECTS: Chrome 14

                We need to remove the 'stroke' attribute as well due to a
                change in Chrome 14 which displays strokes even when the width
                is set to 0.

                To be able to reapply a stroke later, we store it in a data
                attribute.
               */
              var stroke = dom.getAttribute('stroke');
              stroke && dom.setAttribute('data-stroke', stroke);
            } else if (!('strokeColor' in attributes)) {
              /*
               AFFECTS: Chrome 14

               We need to re-apply any previously set stroke color. It might
                have been removed if strokeWidth has been set to 0.
               */
              var dataStroke = dom.getAttribute('data-stroke');
              dataStroke && dom.setAttribute('stroke', dataStroke);
            }
            break;
          case 'matrix':
            if (type === 'Group' || type === 'Movie') {
              if (value != null) {
                var matrix = tools.mixin({}, value);

                // Apply origin of @ top-left of the group/movie:
                dom.style.WebkitTransformOrigin = value.tx + 'px ' + value.ty + 'px';

                // Make matrix properties accurate to 8 decimal points
                // This is to avoid numbers being so small that they use 
                // scientific E notation (e.g. -6.938893903907228e-18)
                // (CSS `transform` property doesn't seem to support this)
                matrix.a = Math.round(matrix.a * 10000000) / 10000000;
                matrix.b = Math.round(matrix.b * 10000000) / 10000000;
                matrix.c = Math.round(matrix.c * 10000000) / 10000000;
                matrix.d = Math.round(matrix.d * 10000000) / 10000000;

                // Clear matrix tx/ty and instead apply directly to child layers
                // via translatePosition method. This is to avoid clipping
                // occuring beyond the top-left of the displayGroup
                matrix.tx = 0;
                matrix.ty = 0;
                el.translatePosition(value.tx, value.ty);

                // Apply transform plus 3d translateZ to kick hardware-accel:
                dom.style.WebkitTransform = 
                  dom.style.MozTransform = 
                    dom.style.MSTransform =
                      dom.style.OTransform =
                        dom.style.transform = matrixToString(matrix) + ' translateZ(0)';
              } else if (value === null) {
                el.translatePosition(0, 0);
                dom.style.WebkitTransform =
                  dom.style.MozTransform =
                    dom.style.MSTransform =
                      dom.style.OTransform =
                        dom.style.transform = '';
              }
            } else {
              if (value != null) {
                dom.setAttribute(
                  'transform',
                  matrixToString(value)
                );
              } else if (value === null) {
                dom.removeAttribute('transform');
              }
            }
            break;
        }
      }
    }
  };

  /**
   * The Renderer constructor
   *
   * @constructor
   * @param {HTMLElement} node The element to append the svg root node to.
   * @param {number} width The width to apply to the svg root node.
   *    Falsy means 'no width applied'.
   * @param {number} height The height to apply to the svg root node.
   *    Falsy means 'no height applied'.
   * @param {boolean} [allowEventDefaults=false] Whether not to preventDefault()
   *    browser events;
   * @param {Function|boolean} [fpsLog=false] Whether to log the frame rate.
   *    true displays the frame rate in the rendering, a function will be called
   *    with the framerate.
   */
  function Renderer(node, width, height, allowEventDefaults, fpsLog) {

    this.width = width;
    this.height = height;

    this.allowEventDefaults = !!allowEventDefaults;

    var display = this.display = new Display(node, width, height);

    // for each element in the tree, [parentId, nextId].join()
    this.definitions = Object.create(null);

    eventTypes.forEach(function(e) {
      display.root.dom.addEventListener(e, this, false);
    }, this);

    // This is necessary to ensure that we receive the touch events
    // TODO: Find out why we need this!
    // Using a global function (`Boolean`) prevents attachment of too many listeners
    document.addEventListener('touchmove', Boolean, false);

    // Bind to key events
    document.addEventListener('keyup', this, false);
    document.addEventListener('keydown', this, false);
    document.addEventListener('keypress', this, false);

    ///////this._setupFPSLog(fpsLog);
  }

  var proto = Renderer.prototype = tools.mixin({}, EventEmitter, eventHandlers);

  var typesToTags = {
    Bitmap: 'image',
    Group: 'g',
    Movie: 'g',
    Path: 'path',
    Text: 'text',
    TextSpan: 'tspan',
    Video: 'foreignObject',
    Mask: 'mask'
  };

  proto.config = function(data) {

    var item = data.item,
        value = data.value;

    switch (item) {
      case 'crispEdges':
        this.display.forEachLayerOfType('svg', function(svg) {
          svg.setAttribute('shape-rendering', value ? 'crispEdges' : 'auto');
        });
        break;
      case 'backgroundColor':
        this.display.root.dom.style.backgroundColor = color(value).rgba();
        break;
    }
  };

  proto.render = function(messages) { 

    var drawName,
      element,
      fragment,
      i,
      id,
      message,
      next,
      parent,
      prev,
      updateIds,
      tails,
      type;

    var self = this;
    var display = this.display;
    var updateMessages = {}, updateParents = {};

    // Go through messages to identify deleted and changed objects, and then
    // draw the object using the draw[ObjectType] method:
    for (i = 0; (message = messages[i++]);) {
      id = message.id;
      type = message.type;

      if (type === 'bitmap_hidden') {
        continue;
      }

      // Check that it's an off-stage el AND that it's the top-most:
      if (message.offStageType && message.parent === 0) {
        message.parent = message.id + '_offStageParent';
      }

      element = display[id];

      if (!element && !message.detach) {
        if (type === 'DOMElement') {
          element = display[id] = new DOMElement(
            document.createElement(message.attributes.nodeName)
          );
          element.dom.setAttribute('data-bs-id', id);
        } else if (type === 'Group' || type === 'Movie') {
          element = display[id] = new DisplayGroup(null, id);
          //element.dom.displayG
        } else {
          element = display[id] = new SVGElement(
            createSVGElement(typesToTags[type], id)
          );
        }
      }

      if (message.detach) {

        var elementToRemove = element, idToRemove = id;

        // message.children contains all child objects that have to be removed
        // together with the parent object.
        var children = message.children || 0, childIndex = 0;

        do {
          if (elementToRemove) {
            var removedElLayer = elementToRemove.parentDisplayLayer;
            this.removeObject(elementToRemove);
            if ((removedElLayer instanceof DisplayLayer) && !(removedElLayer instanceof DisplayGroup) && removedElLayer.isEmpty()) {
              // Remove parent from its own displayGroup
              removedElLayer.parentDisplayGroup.removeLayer(removedElLayer);
            }
          }
          delete display[idToRemove];

          idToRemove = children[childIndex];
          elementToRemove = display[idToRemove];
          childIndex += 1;
        } while (elementToRemove);
      } else {

        if ('parent' in message) { // position has changed
          parent = message.parent;
          (updateParents[parent] || (updateParents[parent] = [])).push(id);
          updateMessages[id] = message;
        }

        if (this[drawName = 'draw' + type]) {
          this[drawName](element.dom, message);
          this.drawAll(type, element.dom, message);
        }

        // Make sure `attr` is called after the draw methods because
        // the draw methods might add wrappers to the elements
        if (message.attributes) {
          display.attr(element, message.attributes, message.type);
        }
      }
    }

    for (parent in updateParents) {
      var updateIds = updateParents[parent];
      for (var i = 0, l = updateIds.length; i < l; ++i) {

        var msg = updateMessages[updateIds[i]];
        parent = display[msg.parent];

        if (parent.isDisplayGroup) {
          var parentGroup = parent;
          if (msg.type === 'DOMElement') {
            // Get the top-most DOM layer or if the top-most layer is not
            // a DOM layer, then make a new one:
            parent = parent.getDOMLayer();
            parent.parentDisplayGroup = parentGroup;
          } else if (msg.type !== 'Group' && msg.type !== 'Movie') {
            // Get the top-most SVG layer or if the top-most layer is not
            // a SVG layer, then make a new one:
            parent = parent.getSVGLayer();
            parent.parentDisplayGroup = parentGroup;
          }
        }

        var el = display[msg.id],
            nextEl = display[msg.next],
            isDOM,
            isNextDOM;

        isDOM = el instanceof DOMElement;

        if (nextEl && nextEl.dom.parentNode) {

          isNextDOM = nextEl instanceof DOMElement;

          if (isNextDOM !== isDOM || ((el instanceof DisplayGroup) && !(nextEl instanceof DisplayGroup))) {
            // i.e. If we're placing either a
            //  DOM element before an SVG element
            //  SVG element before a DOM element

            var nextLayer = nextEl.parentDisplayLayer;

            if (nextEl.dom.parentNode.firstChild !== nextEl) {
              // If the nextEl Element (to be next sibling of el element) is NOT
              // the first in its DisplayLayer then we need to split the contents of
              // the layer, the new one with the nextEl and every element after 
              // nextEl.
              var nextLayer = nextEl.parentDisplayGroup.insertLayerAfter(
                isNextDOM ? 'dom' : 'svg',
                nextEl.parentDisplayLayer
              );
              var appendEl = nextEl.dom;
              do {
                var _appendEl = appendEl;
                appendEl = appendEl.nextSibling;
                nextLayer.appendee.appendChild(_appendEl);
              } while (appendEl);
            }

            if (el.parentDisplayLayer && el.parentDisplayLayer.dom.childNodes.length === 1) {
              // If el is the only child of its current layer then we can
              // move the whole layer
              el.parentDisplayGroup.dom.insertBefore(el.parentDisplayLayer.dom, nextLayer.dom);
            } else {
              
              if (el instanceof DisplayGroup) {
                parent.dom.insertBefore(el.dom, nextLayer.dom);
              } else {
                // If el is not the only child of its current layer then we
                // create a new layer at the right position and insert el
                // into that
                var newLayer = el.parentDisplayGroup.insertLayerBefore(
                  isDOM ? 'dom' : 'svg',
                  nextLayer
                );

                el.parentDisplayLayer = newLayer;

                // Now insert el into new DOMLayer/SVGLayer:
                newLayer.appendee.appendChild(el.dom);
              }
            }

          } else {
            nextEl.dom.parentNode.insertBefore(el.dom, nextEl.dom);
            // Save displayGround reference on descendents:
            el.parentDisplayGroup = nextEl.parentDisplayGroup;
            el.parentDisplayLayer = nextEl.parentDisplayLayer;

          }

          if ((parent instanceof DisplayLayer) && !(parent instanceof DisplayGroup) && parent.isEmpty()) {
            // Remove parent from its own displayGroup
            parent.parentDisplayGroup.removeLayer(parent);
          }
        } else {
          // Save displayGround reference on descendents:
          el.parentDisplayGroup = parent.parentDisplayGroup;
          el.parentDisplayLayer = parent;
         // console.log('Here', parent instanceof DisplayLayer ? parent.appendee : parent, el);
          parent.appendee.appendChild( el.dom );
        }
      }
    }

    //this._logFrame();

    this.emit('canRender');

  };

  /* Presence of these methods required to ensure drawAll is called */
  proto.drawMovie = function() {};

  /**
   * Called along with draw[Whatever].
   * Here we apply filters, clips etc.
   */
  proto.drawAll = function(type, element, message) {

    var hasFilters = false;
    var attr = message.attributes;
    var fillColor = attr.fillColor;
    var fillGradient = attr.fillGradient;
    var filters = attr.filters || [];
    var svg = this.svg;

    // when filter is applied, force fillColor change on UA w/o SVG Filter support
    if (!isFEColorMatrixEnabled && !fillColor && filters && element._fillColorSignature) {
      fillColor = element._fillColorSignature;
    }

    if (filters.length) {
      hasFilters = true;
      this.applyFilters(element, filters);
    } else if (filters === null) {
      element._filterSignature &&
        this.removeFilters(element);
    }

    if (message.offStageType === 'clip') {
      // Fill element with white so it shows through (faking clip with mask)
      attr.fillImage = null;
      fillGradient = attr.fillGradient = null;
      fillColor = attr.fillColor = 0xFFFFFFFF;
    }

    if (attr.clipId) {

      // SVG doesn't support clips as well as masks (e.g. no groups)
      // So, we use masks for clips:

      var svgClipId = attr.clipId + '_offStageParent';

      if (!(element._clip = this.display[svgClipId])) {
        console.log('Creating offStage', svgClipId)
        element._clip = this.display[svgClipId] = this.display.svgResourcesDefs.appendChild(createSVGElement('mask'));
        element._clip.id = this._genDefUID();
        element._clip._clipId = svgClipId; // Save real ID too (as in `this.svg`)
        element._clip.n = 1;
      } else {
        if (element._clip !== this.display[svgClipId]) {
          element._clip.n++;
        }
      }

      element.setAttribute('mask', 'url(#' + element._clip.id + ')');
    } else if (attr.clipId === null) {
      this.removeClip(element);
    }

    if (attr.maskId) {
      this.applyMask(element, attr);
    } else if (attr.maskId === null) {
      this.removeMask(element);
    }

    if (attr.visible != null) {
      element.style.visibility = attr.visible ? '' : 'hidden';
    }

    if (type === 'Path' || type === 'Text' || type === 'TextSpan') {
      // Apply fill style(s)
      if (
        attr.fillImageId ||
        (fillGradient && (
          fillColor ||
          attr.fillRepeat && attr.fillRepeat.join() !== '1,1'
        ))
      ) {
        if (isWebkitPatternBug) {
          this.applyWebkitFills(element, message);
        } else {
          this.applyFills(element, message.attributes);
        }
      } else if (fillGradient) {
        this.applyFillGradient(element, fillGradient, attr.matrix);
      } else if (fillColor != null) {
        this.applyFillColor(element, fillColor);
      }
      if ('fillImageId' in attr && !attr.fillImageId) {
        this.removeFillImage(element);
      }

      // Apply stroke style(s)
      if ('strokeColor' in attr) {
        this.applyStrokeColor(element, attr.strokeColor, '', attr.strokeWidth);
      }

      if ('strokeGradient' in attr) {
        this.applyStrokeGradient(element, attr.strokeGradient, '', attr.strokeWidth);
      }
    }
  };

  proto.drawPath = function(path, message) {
    var shapeData = message.data;
    if (shapeData) {
      path.setAttribute('d', exportToPath(shapeData, true));
    }
  };

  proto.drawBitmap = function(img, message) {

    var attributes = message.attributes;
    //TODO: can't we set preserveAspectRatio only when `attributes.source != null`?
    img.setAttribute('preserveAspectRatio', 'none');

    var naturalWidth = attributes.naturalWidth;
    var naturalHeight = attributes.naturalHeight;

    var ratio = naturalHeight / naturalWidth;

    if (attributes.source != null) {
      img.setAttributeNS(xlink, 'href', AssetController.assets[message.id].src);
    }

    if (attributes.width == null && attributes.height == null) {
      attributes.width = naturalWidth;
      attributes.height = naturalHeight;
    }

    if (attributes.height == null) {
      attributes.height = (attributes.width || 0) * ratio;
    }

    if (attributes.width == null) {
      attributes.width = (attributes.height || 0) / ratio;
    }

    attributes.height && img.setAttribute('height', attributes.height);
    attributes.width && img.setAttribute('width', attributes.width);
  };

  proto.drawTextSpan = function(tspan, message) {

    var attributes = message.attributes,
        fontSize = attributes.fontSize,
        fontFamily = attributes.fontFamily;

    tspan.setAttributeNS(xlink, 'text-anchor', 'start');
    tspan.setAttribute('alignment-baseline', 'inherit');
    if (attributes.selectable !== false) {
      cssClasses.add(tspan, 'selectable');
    } else {
      cssClasses.remove(tspan, 'selectable');
    }

    if (attributes.glyphx) {
      tspan.setAttribute('x', attributes.glyphx.join(' '));
    } else if(attributes.glyphx === null) {
      tspan.removeAttribute('x');
    }

    if (attributes.glyphy) {
      tspan.setAttribute('y', attributes.glyphy.join(' '));
    } else if(attributes.glyphy === null) {
      tspan.removeAttribute('y');
    }

    if (tspan._text !== attributes.text) {
      // attribute is different to cached text is different, overwrite text nodes:
      while (tspan.firstChild) {
        tspan.removeChild(tspan.firstChild);
      }
      tspan._text = attributes.text;
      tspan.appendChild(document.createTextNode(attributes.text));
    }
  };

  proto.drawText = function(text, message) {

    var attributes = message.attributes,
        fontSize = attributes.fontSize,
        fontFamily = attributes.fontFamily;

    if (attributes.selectable !== false) {
      cssClasses.add(text, 'selectable');
    } else {
      cssClasses.remove(text, 'selectable');
    }

    text.setAttributeNS(xlink, 'text-anchor', 'start');

    if (attributes.textOrigin != null) {
      text.setAttribute(
        'alignment-baseline',
        attributes.textOrigin === 'top' ? 'hanging' : ''
      );
    }

    var style = text.style;
    style.textAnchor = 'start';
  };

  proto.drawVideo = function(foreignObject, message) {

    // assuming a valid assetId
    var attributes = message.attributes;
    var id = message.id;
    var video = AssetController.assets[id];

    if (typeof video === 'undefined') {
      throw Error('asset <' + id + '> is unkown.');
    }

    var obj = this.svg[id];
    var width = attributes.width || 100;
    var height = attributes.height || 100;
    var matrix = attributes.matrix || {tx: 0, ty: 0};

    foreignObject.setAttribute('x', matrix.tx);
    foreignObject.setAttribute('y', matrix.ty);
    foreignObject.setAttribute('width', width);
    foreignObject.setAttribute('height', height);
    foreignObject.setAttribute('preserveAspectRatio', 'none');

    // work-around: some browsers cannot transform the content of a foreignObject
    // e.g. webkit: http://code.google.com/p/chromium/issues/detail?id=87072
    // check http://double.co.nz/video_test/video.svg
    foreignObject.removeAttribute('transform');

    video.setAttribute('width', width);
    video.setAttribute('height', height);
    video.setAttribute('controls', 'controls');

    if (attributes.autoplay) {
      video.play();
    }

    foreignObject.appendChild(video);
  };

  proto.drawDOMElement = function(element, message) {

    //var container = document.createElement('div');
    //this.svg.root.parentNode.insertBefore(container, this.svg.root.nextSibling);
    ///container.style.position = 'absolute';
    //.svg.addLayer();

    // assuming a valid assetId
    var body,
        attributes = message.attributes,
        css = attributes.css,
        id = message.id,
        parent = this.display[message.parent];

    //if (element._root) {
      // Make sure top-level DOM element's width and height are applied
      // to the containing <foreignObject>. We don't want the <foreignObject>
      // to be any bigger than it has to be.
      if ('css_width' in attributes && /px$/.test(attributes.css_width)) {
        element.setAttribute('width', attributes.css_width);
      }
      if ('css_height' in attributes && /px$/.test(attributes.css_height)) {
        element.setAttribute('height', attributes.css_height);
        // Save height for the forced repaint below:
        element._height = attributes.css_height;
      }
    //}

    // Mark the element as one with a corresponding BS DOMElement object
    element._isBSDOMElement = true;

    for (var i in attributes) {
      if (/^dom_/.test(i)) {
        if (i === 'dom_innerHTML') {
          element.innerHTML = (attributes[i] || '').replace(/\{\{prefix\}\}/g, fontPrefix);
        } else {
          element.setAttribute(i.slice(4), attributes[i]);
        }
      } else if(/^css_/.test(i) && typeof attributes[i] !== 'undefined') {
        element.style[i.slice(4)] = attributes[i].toString().replace(/\{\{prefix\}\}/g, fontPrefix);
      }
    }

  };

  proto.removeObject = function(element) {

    var rootElement = element.dom,
        parent = rootElement.parentNode;

    if (parent) {
      parent.removeChild(rootElement);
    }

    var layer = element.parentDisplayLayer;

    if (layer.dom.childNodes.length === 0) {
      element.parentDisplayGroup.removeLayer(layer);
    }

    if (element._pattern) {
      this.removeFillImage(element);
      this.display.svgResourcesDefs.removeChild(element._pattern);
      element._pattern._fillGradientSignature &&
        this.removeGradient(element._pattern, 'fill');
    }

    element._fillGradientSignature &&
      this.removeGradient(element, 'fill');

    element._strokeGradientSignature &&
      this.removeGradient(element, 'stroke');

    this.removeMask(element);

    element._filterSignature &&
      this.removeFilters(element);
  };

  proto.removeFilters = function(element) {

    // TODO: reset color in respect to filter-shim

    var signature = element._filterSignature,
        def = this.definitions[signature];

    if (!def) {
      return;
    }

    if (def.n > 1) {
      def.n--;
    } else {
      this.display.svgResourcesDefs.removeChild(def.element);
      delete this.definitions[signature];
    }

    delete element._filterSignature;
  };

  proto.removeFillImage = function(element) {
    var pattern = element._pattern;
    if (pattern && pattern._fillImage) {
      pattern.removeChild(pattern._fillImage);
      delete this.display[pattern._fillImage._fillImageId];
      delete pattern._fillImage;
    }
  };

  proto.removeGradient = function(element, attr) {

    var signature = element['_' + attr + 'GradientSignature'],
        def = this.definitions[signature];

    if (!def) {
      return;
    }

    if (def.n > 1) {
      def.n--;
    } else {
      this.display.svgResourcesDefs.removeChild(def.element);
      delete this.definitions[signature];
    }

    delete element['_' + attr + 'GradientSignature'];
  };

  proto.removeClip = function(element) {
    var clip = element._clip;
    if (clip) {
      if (clip.n > 1) {
        clip.n--;
      } else {
        this.display.svgResourcesDefs.removeChild(clip);
        delete this.display[clip._clipId];
      }
      element.removeAttribute('mask');
      delete element._clip;
    }
  };

  proto.removeMask = function(element) {
    var mask = element._mask;
    if (mask) {
      if (mask.n > 1) {
        mask.n--;
      } else {
        this.display.svgResourcesDefs.removeChild(mask);
        delete this.display[mask._maskId];
      }
      element.removeAttribute('mask');
      delete element._mask;
    }
  };

  proto.destroy = function() {
    var display = this.display;
    // remove event listeners
    eventTypes.forEach(function(e) {
      display.root.dom.removeEventListener(e, this, false);
    }, this);

    // remove key listeners
    document.removeEventListener('keyup', this, false);
    document.removeEventListener('keydown', this, false);
    document.removeEventListener('keypress', this, false);

    // stop fps interval
    clearInterval(this._fpsInterval);

    display.root.dom.parentNode && display.root.dom.parentNode.removeChild(display.root.dom);
    delete this.display;
  };

  proto._genDefUID = function() {
    // Generate unique ID for new <Def> element
    return 'def-' + +new Date + '-' + (
      this.__defID = this.__defID ? this.__defID + 1 : 1
    );
  };

  proto.applyFillColor = function(element, aColor, filterSignature) {
    return this.applyColor('fill', element, aColor, filterSignature);
  };

  proto.applyStrokeColor = function(element, aColor, filterSignature, strokeWidth) {

    if (aColor != null) {
      /*
       AFFECTS: Chrome 14

       We can only set the stroke attribute if the stroke should also
        have a width. Otherwise, we store the color on a data-attribute
        for later usage.
       */
      if (strokeWidth > 0 || +element.getAttribute('stroke-width')) {
        this.applyColor('stroke', element, aColor, filterSignature);
      } else {
        this.applyColor('data-stroke', element, aColor, filterSignature);
      }
    } else if (aColor === null) {
      element.removeAttribute('stroke');
      element.removeAttribute('data-stroke');
    }
  };

  proto.applyStrokeGradient = function(element, gradient, filterSignature, strokeWidth) {
    if (gradient != null) {
      /*
       AFFECTS: Chrome 14

       We can only set the stroke attribute if the stroke should also
        have a width. Otherwise, we store the color on a data-attribute
        for later usage.
       */
      if (strokeWidth > 0 || +element.getAttribute('stroke-width')) {
        this.applyGradient('stroke', element, gradient, gradient.matrix, filterSignature);
      } else {
        this.applyGradient('data-stroke', element, gradient, gradient.matrix, filterSignature);
      }
    } else if (gradient === null) {
      element.removeAttribute('stroke');
      element.removeAttribute('data-stroke');
    }
  };

  /**
   * Applies fill or stroke color to an element
   *
   * @param {DOMElement} element A DOM Element
   * @param {String} styleAttribute "fill" or "stroke"
   * @param {Number} aColor Color with 32-bit int repr.
   * @param {String} filterSignature [optional]
   */
  proto.applyColor = function(styleAttribute, element, aColor, filterSignature) {

    filterSignature = element._filterSignature || filterSignature;
    element['_' + styleAttribute + 'ColorSignature'] = aColor;

    var colorMatrix, rgbaInstance = color(aColor);

    // apply colorMatrix shim when SVGFEColorMatrix isn't enabled and a filter is applied
    if (!isFEColorMatrixEnabled && filterSignature) {
      colorMatrix = valueFromSignatureForType(filterSignature, 'colorMatrix');
      colorMatrix && rgbaInstance.setColorMatrix(colorMatrix.split(','));
    }

    //element.style[styleAttribute] = rgbaInstance.rgba();
    element.setAttribute(styleAttribute, rgbaInstance.rgba());
  };

  proto.applyFillGradient = function(element, gradient, matrix, filterSignature) {
    return this.applyGradient('fill', element, gradient, matrix, filterSignature);
  };

  /**
   * Applies gradients (currently only linear gradients) to an element
   */
  proto.applyGradient = function(styleAttribute, element, gradient, matrix, filterSignature) {

    filterSignature = element._filterSignature || filterSignature;

    var colorMatrix,
        colorMatrixString,
        gradientDef,
        gradientEl,
        stop,
        stopEl,
        stopColor,
        i, l;
    var stops = gradient.stops,
        signature = gradientToSignature(gradient),
        signatureKey = '_' + styleAttribute + 'GradientSignature';

    // apply colorMatrix shim when SVGFEColorMatrix isn't enabled and a filter is applied
    if (!isFEColorMatrixEnabled && filterSignature) {
      colorMatrixString = valueFromSignatureForType(filterSignature, 'colorMatrix');
      colorMatrixString && (colorMatrix = colorMatrixString.split(','));
    }

    // We already have an identical gradient -- use it:
    // ColorMatrix-Shim is enabled -- don't use it:
    if (!colorMatrix && signature in this.definitions) {
      gradientDef = this.definitions[signature];
      if (element[signatureKey] !== signature) {
        gradientDef.n++;
        element[signatureKey] = signature;
        element.setAttribute(styleAttribute, 'url(#' + gradientDef.element.id + ')');
      }
      return;
    }

    // If the element already has an attached gradient we may be able
    // to use it (as long as it's not being used by something else)
    if (element[signatureKey]) {

      gradientDef = this.definitions[element[signatureKey]];

      if (gradientDef.n > 1) {
        gradientDef.n--;
      } else {
        // We'll use it, empty it first though:
        delete this.definitions[element[signatureKey]];
        gradientEl = gradientDef.element;
        while (stopEl = gradientEl.firstChild) {
          gradientEl.removeChild(stopEl);
        }
      }
    }

    element[signatureKey] = signature;

    // Create a new gradient to place in <defs>:

    switch (gradient.type) {
      case 'linear-gradient': {

        var angle,
            vector,
            vectorMax,
            direction;

        if (isNaN(gradient.direction)) {
          // Not a number: must be an array (vector)
          vector = gradient.direction;
        } else {

          // Change to SVG's degrees
          // (0@NorthClockwise -> 0@EastCounterClockwise)
          direction = 360 - gradient.direction - 270;

          if (direction < 0) {
            direction += 360;
          }

          angle = -direction;

          // Work out vector for x1,x2,y1,y2 values:
          // See: http://www.w3.org/TR/SVG/pservers.html#Introduction
          // We're converting the angle (what bonsai provides) to a vector:

          vector = [0, 0, Math.cos(Math.PI/180*angle), Math.sin(Math.PI/180*angle)];
          vectorMax = 1 / (Math.max(Math.abs(vector[2]), Math.abs(vector[3])) || 1);

          vector[2] *= vectorMax;
          vector[3] *= vectorMax;

          if (vector[2] < 0) {
              vector[0] = -vector[2];
              vector[2] = 0;
          }
          if (vector[3] < 0) {
              vector[1] = -vector[3];
              vector[3] = 0;
          }

        }

        if (!gradientEl) {
          // Doesn't exist yet -- create it:
          gradientEl = createSVGElement('linearGradient');
          gradientEl.setAttribute('gradientTransform', matrixToString(gradient.matrix));
          gradientEl.setAttribute(
            'gradientUnits',
            gradient.units == 'boundingBox' ? 'objectBoundingBox' : 'userSpaceOnUse'
          );
          gradientEl.setAttribute('spreadMethod', 'PAD');

          gradientEl.id = this._genDefUID();
        }

        for (i = 0, l = stops.length; i < l; ++i) {
          stop = stops[i];
          stopEl = createSVGElement('stop');
          stopColor = colorMatrix ? color(stop[0]).setColorMatrix(colorMatrix) : color(stop[0]);

          stopEl.setAttribute('offset', stop[1] + '%');
          stopEl.setAttribute('stop-color', stopColor.rgb());
          stopEl.setAttribute('stop-opacity', stopColor.a());

          gradientEl.appendChild(stopEl);
        }

        gradientEl.setAttribute('x1', vector[0]);
        gradientEl.setAttribute('y1', vector[1]);
        gradientEl.setAttribute('x2', vector[2]);
        gradientEl.setAttribute('y2', vector[3]);

        break;
      }
      case 'radial-gradient': {

        if (!gradientEl) {
          // Doesn't exist yet -- create it:
          gradientEl = createSVGElement('radialGradient');
          gradientEl.setAttribute(
            'gradientUnits',
            gradient.units == 'boundingBox' ? 'objectBoundingBox' : 'userSpaceOnUse'
          );
          gradientEl.setAttribute('spreadMethod', 'PAD');
          gradientEl.id = this._genDefUID();
        }

        gradientEl.setAttribute('gradientTransform', matrixToString(gradient.matrix));

        for (i = 0, l = stops.length; i < l; ++i) {

          stop = stops[i];
          stopEl = createSVGElement('stop');
          stopColor = colorMatrix ? color(stop[0]).setColorMatrix(colorMatrix) : color(stop[0]);

          stopEl.setAttribute('offset', stop[1] + '%');
          stopEl.setAttribute('stop-color', stopColor.rgb());
          stopEl.setAttribute('stop-opacity', stopColor.a());

          gradientEl.appendChild(stopEl);
        }

        gradientEl.setAttribute('cx', '0%');
        gradientEl.setAttribute('cy', '0%');
        gradientEl.setAttribute('r', gradient.radius);
        gradientEl.setAttribute('fx', gradient.fx);
        gradientEl.setAttribute('fy', gradient.fy);

        break;
      }
    }

    this.display.svgResourcesDefs.appendChild(gradientEl);
    element.setAttribute(styleAttribute, 'url(#' + gradientEl.id + ')');

    // Save the new gradient to this.definitions:
    this.definitions[signature] = {
      n: 1,
      element: gradientEl
    };
  };

  proto.applyWebkitFills = function(element, message) {

    var boundingBox, group, image, mask;
    var attributes = message.attributes,
        display = this.display,
        defs = display.svgResourcesDefs,
        fillRepeat = attributes.fillRepeat,
        fillRepeatX = fillRepeat && fillRepeat[0] || 1,
        fillRepeatY = fillRepeat && fillRepeat[1] || 1,
        fillColor = attributes.fillColor,
        fillGradient = attributes.fillGradient;

    var group = element._friend,
        pattern = group && group._pattern,
        patternFillImage = group && group._fillImage,
        patternFillGradient = group && group._fillGradient,
        patternFillColor = group && group._fillColor,
        isNewPattern = !pattern;

    // getBBox wants us to append `element` to the dom tree
    display.svgResourcesLayer.dom.appendChild(element);

    if (isNewPattern) {

      boundingBox = element.getBBox();

      // group
      group = (function createGroup(id, dict, aBoundingBox, aMatrix) {
        var aGroup = createSVGElement('g', id);
        dict[id] = new SVGElement(aGroup);
        aMatrix.tx += aBoundingBox.x;
        aMatrix.ty += aBoundingBox.y;
        aGroup.setAttribute('transform', matrixToString(aMatrix));
        return aGroup;
      })(message.id, display, boundingBox, attributes.matrix);

      // create a mask node and append it to the <defs> section
      mask = (function createMask(aGroup, id, defsNode) {
        var mask = createSVGElement('mask');
        mask.id = id;
        defsNode.appendChild(mask);
        group._pattern = mask;
        group.setAttribute('mask', 'url(#' + id + ')');
        mask.appendChild(element);
      })(group, this._genDefUID(), defs);

      // manipulate element's message and attributes
      element._friend = group;
      attributes.matrix.tx = -1*boundingBox.x;
      attributes.matrix.ty = -1*boundingBox.y;

      element.setAttribute('fill', 'rgba(255, 255, 255, 1)');
      element._friend = group;
    }

    if (!patternFillImage && attributes.fillImageId) {
      patternFillImage = group._fillImage = createSVGElement('g');
      patternFillImage._fillImageId = attributes.fillImageId + '_offStageParent';
      display[patternFillImage._fillImageId] = patternFillImage;
    }

    if (!patternFillGradient && fillGradient) {
      boundingBox || (boundingBox = element.getBBox());
      patternFillGradient = group._fillGradient = createSVGElement('rect');
      patternFillGradient.setAttribute('x', 0);
      patternFillGradient.setAttribute('y', 0);
      patternFillGradient.setAttribute('width', boundingBox.width);
      patternFillGradient.setAttribute('height', boundingBox.height);
    }

    if (fillColor) {
      patternFillColor = group._fillColor = createSVGElement('rect');
      patternFillColor.setAttribute('x', 0);
      patternFillColor.setAttribute('y', 0);
      patternFillColor.setAttribute('width', boundingBox.width);
      patternFillColor.setAttribute('height', boundingBox.height);
      if (patternFillColor._fillColorSignature !== fillColor) {
        this.applyFillColor(patternFillColor, fillColor);
      } else if (patternFillColor._fillColorSignature !== 0) {
        this.applyFillColor(patternFillColor, 0);
      }
    }

    if (fillGradient) {
      this.applyFillGradient(patternFillGradient, fillGradient, attributes.matrix);
      group._fillGradientSignature = patternFillGradient._fillGradientSignature; // copy across so it can be deleted easily
    }

    if (isNewPattern) {
      patternFillColor && group.appendChild(patternFillColor);
      patternFillGradient && group.appendChild(patternFillGradient);
      patternFillImage && group.appendChild(patternFillImage);
    }

    // Remove element from tree (it was only added to retrieve BBox)
    display.svgResourcesLayer.dom.removeChild(element);

  };

  proto.applyFills = function(element, attributes) {

    // Apply both fills, color under gradient and/or image:
    // Use a pattern to contain fills

    var boundingBox,
        display = this.display,
        defs = display.svgResourcesDefs,
        fillRepeat = attributes.fillRepeat,
        fillRepeatX = fillRepeat && fillRepeat[0] || 1,
        fillRepeatY = fillRepeat && fillRepeat[1] || 1,
        fillColor = attributes.fillColor,
        fillGradient = attributes.fillGradient;

    var pattern = element._pattern,
        patternFillImage = pattern && pattern._fillImage,
        patternFillGradient = pattern && pattern._fillGradient,
        patternFillColor = pattern && pattern._fillColor,
        isNewPattern = !pattern;

    // Add element so we can get BBox
    display.svgResourcesLayer.dom.appendChild(element);

    if (isNewPattern) {

      boundingBox = element.getBBox();

      pattern = element._pattern = createSVGElement('pattern');
      patternFillColor = pattern._fillColor = createSVGElement('rect');

      pattern.setAttribute('patternUnits', 'objectBoundingBox');
      pattern.setAttribute('patternContentUnits', 'userSpaceOnUse');

      pattern.setAttribute('width', 1 / fillRepeatX);
      pattern.setAttribute('height', 1 / fillRepeatY);
      pattern.setAttribute('x', 0);
      pattern.setAttribute('y', 0);

      patternFillColor.setAttribute('width', boundingBox.width / fillRepeatX);
      patternFillColor.setAttribute('height', boundingBox.height / fillRepeatY);
      patternFillColor.setAttribute('x', 0);
      patternFillColor.setAttribute('y', 0);
    }

    if (!patternFillGradient && fillGradient) {
      boundingBox || (boundingBox = element.getBBox());
      patternFillGradient = pattern._fillGradient = createSVGElement('rect');
      patternFillGradient.setAttribute('width', boundingBox.width / fillRepeatX);
      patternFillGradient.setAttribute('height', boundingBox.height / fillRepeatY);
      patternFillGradient.setAttribute('x', 0);
      patternFillGradient.setAttribute('y', 0);
    }

    if (!patternFillImage && attributes.fillImageId) {
      patternFillImage = pattern._fillImage = createSVGElement('g');
      patternFillImage._fillImageId = attributes.fillImageId + '_offStageParent';
      this.display[patternFillImage._fillImageId] = new SVGElement(patternFillImage);
    }

    if (fillColor) {
      if (patternFillColor._fillColorSignature !== fillColor) {
        this.applyFillColor(patternFillColor, fillColor);
      }
    } else {
      if (patternFillColor._fillColorSignature !== 0) {
        this.applyFillColor(patternFillColor, 0);
      }
    }

    if (fillGradient) {
      this.applyFillGradient(patternFillGradient, fillGradient, attributes.matrix);
      pattern._fillGradientSignature = patternFillGradient._fillGradientSignature; // copy across so it can be deleted easily
    }

    if (isNewPattern) {
      pattern.appendChild(patternFillColor);
      patternFillGradient && pattern.appendChild(patternFillGradient);
      patternFillImage && pattern.appendChild(patternFillImage);
      pattern.id = this._genDefUID();
      element.setAttribute('fill', 'url(#' + pattern.id + ')');
      defs.appendChild(pattern);
    }

    // Remove element from tree (it was only added to retrieve BBox)
    display.svgResourcesLayer.dom.removeChild(element);
  };

  proto.applyFilters = function(element, list) {

    var filterDef;
    var signature = 'filter:';

    // create signature
    signature += list.map(function(filter) {
      return filterToSignature(filter);
    }).join();

    // compare signature with existing signatures
    if (signature in this.definitions) {
      // We already have an identical filter -- use it:
      filterDef = this.definitions[signature];
      if (element._filterSignature !== signature) {
        filterDef.n++;
        element._filterSignature = signature;
        element.setAttribute('filter', 'url(#' + filterDef.element.id + ')');
      }
      return;
    }

    // If the element already has an attached filter we may be able
    // to use it (as long as it's not being used by something else)
    if (element._filterSignature) {

      filterDef = this.definitions[element._filterSignature];

      if (filterDef.n > 1) {
        // decrease retain count b/c filter is used by other elements
        filterDef.n--;
      } else {
        // remove old filter
        filterDef.element.parentNode.removeChild(filterDef.element);
        element.removeAttribute('filter');
        delete this.definitions[element._filterSignature];
      }
    }

    var filterContainer = createSVGElement('filter');

    filterContainer.id = this._genDefUID();

    // Create a filter-region that is big enough to make filters visible
    // that overflow the original bounding box.
    filterContainer.setAttribute('x', '-100%');
    filterContainer.setAttribute('y', '-100%');
    filterContainer.setAttribute('width', '300%');
    filterContainer.setAttribute('height', '300%');

    // handle filter specific stuff and get an array of <filter> elements back
    var filterElements = filterElementsFromList(list);
    for (var i = 0, len = filterElements.length; i < len; i += 1) {
      filterContainer.appendChild(filterElements[i]);
    }

    this.display.svgResourcesDefs.appendChild(filterContainer);
    element.setAttribute('filter', 'url(#' + filterContainer.id + ')');
    element._filterSignature = signature;
    // Save the new gradient to this.definitions:
    this.definitions[signature] = {
      n: 1,
      element: filterContainer
    };
  };

  proto.applyMask = function(element, attr) {

    var maskId = attr.maskId + '_offStageParent';
    var dictionary = this.display;

    if (!(element._mask = dictionary[maskId])) {
      element._mask = dictionary[maskId] = this.display.svgResourcesDefs.appendChild(createSVGElement('mask'));
      element._mask.id = this._genDefUID();
      element._mask._maskId = maskId; // Save real ID too (as in `this.display`)
      element._mask.n = 1;
    } else {
      if (element._mask !== dictionary[maskId]) {
        element._mask.n++;
      }
    }
    element.setAttribute('mask', 'url(#' + element._mask.id + ')');
  }

  proto.getOffset = function() {

    var ctm,
        offset = this.display.root.dom.getBoundingClientRect();

    if (isNaN(offset.left) || isNaN(offset.top)) {
      ctm = this.display.root.dom.getScreenCTM();
      offset.left = ctm.e;
      offset.top = ctm.f;
    }

    return offset;
  };

  proto._setupFPSLog = function(fpsLog) {
    var isFunction = typeof fpsLog === 'function';
    if (fpsLog !== true || isFunction) {
      return;
    }

    if (!isFunction) {
      this.render([
        {
          parent:0,
          id:0.5,
          type:'Text',
          attributes:{
            matrix:{
              a:1, b:0, c:0, d:1,
              tx:10, ty:20
            }
          }
        }
      ]);
    }

    this._fpsInterval = setInterval(tools.hitch(this, function () {

      var fps = this.getFPS();

      if (isFunction) {
        // Custom fpsLog function. Run it:
        fpsLog(fps);
      } else /*if (fpsLog === true)*/ {
        // Display FPS in top-left of stage
        this.render([
          {
            id: 0.6,
            parent: 0.5,
            type: 'TextSpan',
            attributes: {
              text: fps + 'FPS',
              textFillColor: 255,
              fontFamily: 'Arial'
            }
          }
        ]);
        this.svg.root.appendChild(this.svg[0.5]); // re-append (keep it at top)
      }
    }), 1000);
  };

  proto._logFrame = function() {
    (this._frameTimes || (this._frameTimes = [])).push(+new Date);
  };

  proto.getFPS = function() {

    var frames = this._frameTimes,
        fps = 0,
        time = +new Date - 1000;

    for (var l = frames.length; l--;) {
      if (frames[l] < time) break;
      ++fps;
    }

    // Remove older frames
    this._frameTimes = frames.slice(l);

    return fps;
  };

  Renderer.Display = Display;

  return Renderer;
});
