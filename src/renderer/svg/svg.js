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
  './svg_filters',
  './svg_helper',
  './svg_event_handlers',
  '../../asset/asset_controller'
], function(EventEmitter, tools, color, segmentHelper, svgFilters, svgHelper, eventHandlers, AssetController) {
  'use strict';

  var elCache = {};
  // this decides if a svg-pattern-bugfix is applied
  // targets webkit based browsers from version 530.0 to 534.4
  var isWebkitPatternBug = /AppleWebKit\/53([0-3]|4.([0-4]))/.test(navigator.appVersion);

  // Math
  var min = Math.min;
  var max = Math.max;

  // svgHelper
  var cssClasses = svgHelper.cssClasses,
      matrixToString = svgHelper.matrixToString,
      gradientToSignature = svgHelper.gradientToSignature,
      filterToSignature = svgHelper.filterToSignature,
      valueFromSignatureForType = svgHelper.valueFromSignatureForType,
      exportToPath = segmentHelper.exportToPath;

  // svgFilters
  var isFEColorMatrixEnabled = svgFilters.isFEColorMatrixEnabled,
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

  // tools
  var isArray = tools.isArray;

  var xlink = 'http://www.w3.org/1999/xlink';

  function createElement(n, id) {
    if (!n) {
      throw TypeError('Invalid tag name: ' + n);
    }
    var el = (elCache[n] || (elCache[n] = document.createElementNS('http://www.w3.org/2000/svg', n))).cloneNode(false);
    if (id || id === 0) {
      el.setAttribute('data-bs-id', id);
    }
    return el;
  }

  function Svg(node, width, height) {

    var root = this.root = this[0] = createElement('svg', 0);

    // We require an additional rootContainer div so we can accurately
    // retrieve the position of the movie in getOffset on iOS devices.
    var rootContainer = this.rootContainer = document.createElement('div');
    rootContainer.style.paddingLeft = '0';
    rootContainer.style.paddingTop = '0';

    if (width) {
      root.setAttribute('width', width);
    }
    if (height) {
      root.setAttribute('height', height);
    }
    svgHelper.cssClasses.add(root, 'nonSelectable');

    this.viewBox(width, height);

    this.defs = this.root.appendChild(createElement('defs'));
    rootContainer.appendChild(root);
    node.appendChild(rootContainer);
  }

  Svg.prototype = {

    viewBox: function (width, height) {
      if (width && height) {
        this.root.setAttribute('viewBox', '-0.5 -0.5 ' + width + ' ' + height);
      }
    },

    attr: function(el, attributes) {

      var value;

      for (var i in attributes) {

        value = attributes[i];

        if (i in basicAttributeMap) {
          if (value != null) {
            el.setAttribute(basicAttributeMap[i], value);
          } else if (value === null) {
            el.removeAttribute(basicAttributeMap[i]);
          }
          continue;
        }

        switch (i) {
          case 'interactive':
            el.style.pointerEvents = value ? 'inherit' : 'none';
            break;
          case 'fontFamily':
            value = fontIDs[value] || value;
            if (value != null) {
              el.setAttribute('font-family', value);
            } else if (value === null) {
              el.removeAttribute('font-family');
            }
            break;
          case 'strokeWidth':

            el.setAttribute('stroke-width', value);
            if (value <= 0) {
              /*
                AFFECTS: Chrome 14

                We need to remove the 'stroke' attribute as well due to a
                change in Chrome 14 which displays strokes even when the width
                is set to 0.

                To be able to reapply a stroke later, we store it in a data
                attribute.
               */
              var stroke = el.getAttribute('stroke');
              stroke && el.setAttribute('data-stroke', stroke);
            } else if (!('strokeColor' in attributes)) {
              /*
               AFFECTS: Chrome 14

               We need to re-apply any previously set stroke color. It might
                have been removed if strokeWidth has been set to 0.
               */
              var dataStroke = el.getAttribute('data-stroke');
              dataStroke && el.setAttribute('stroke', dataStroke);
            }
            break;
          case 'matrix':
            if (value != null) {
              el.setAttribute(
                'transform',
                matrixToString(value)
              );
            } else if (value === null) {
              el.removeAttribute('transform');
            }
            break;
        }
      }
    }
  };

  /**
   * The SvgRenderer constructor
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
  function SvgRenderer(node, width, height, options) {
    options = options || {};
    this.width = width;
    this.height = height;
    this.allowEventDefaults = !!options.allowEventDefaults;

    var svg = this.svg = new Svg(node, width, height);

    // for each element in the tree, [parentId, nextId].join()
    this.definitions = Object.create(null);

    eventTypes.forEach(function(e) {
      svg.root.addEventListener(e, this, false);
    }, this);

    // This is necessary to ensure that we receive the touch events
    // TODO: Find out why we need this!
    // Using a global function (`Boolean`) prevents attachment of too many listeners
    document.addEventListener('touchmove', Boolean, false);

    // Bind to key events
    document.addEventListener('keyup', this, false);
    document.addEventListener('keydown', this, false);
    document.addEventListener('keypress', this, false);

    this._setupFPSLog(options.fpsLog);
    if (options.disableContextMenu) {
      this.config({
        item: 'disableContextMenu',
        value: true
      });
    }
  }

  var proto = SvgRenderer.prototype = tools.mixin({}, EventEmitter, eventHandlers);

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
        this.svg.root.setAttribute('shape-rendering', value ? 'crispEdges' : 'auto');
        break;
      case 'backgroundColor':
        this.svg.root.style.backgroundColor = color(value).rgba();
        break;
      case 'disableContextMenu':
        this.svg.root.oncontextmenu = value ? function() { return false; } : null;
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
    var svg = this.svg;
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

      element = svg[id];

      if (!element && !message.detach) {
        if (type === 'DOMElement') {
          element = svg[id] = document.createElement(message.attributes.nodeName);
          element.setAttribute('data-bs-id', id);
        } else if (type === 'Audio') {
          element = svg[id] = AssetController.assets[id];
        } else {
          element = svg[id] = createElement(typesToTags[type], id);
        }
      }

      if (message.detach) {

        var elementToRemove = element, idToRemove = id;

        // message.children contains all child objects that have to be removed
        // together with the parent object.
        var children = message.children || 0, childIndex = 0;

        do {
          if (elementToRemove) {
            this.removeObject(elementToRemove);
          }
          delete svg[idToRemove];

          idToRemove = children[childIndex];
          elementToRemove = svg[idToRemove];
          childIndex += 1;
        } while (elementToRemove);
      } else {

        if ('parent' in message) { // position has changed
          parent = message.parent;
          (updateParents[parent] || (updateParents[parent] = [])).push(id);
          updateMessages[id] = message;
        }

        if (this[drawName = 'draw' + type]) {
          this[drawName](element, message);
          this.drawAll(type, element, message);
        }

        if (!isFEColorMatrixEnabled && type === 'Group') {
          (function applyFilterShimOnGroup(el, filterSignature) {

            if (!filterSignature) {
              return;
            }
            var child = el.firstChild || {};
            do {
              if (child instanceof SVGGElement) {
                applyFilterShimOnGroup(child, child._filterSignature);
              }
              if (child._fillColorSignature) {
                self.applyFillColor(child, child._fillColorSignature, filterSignature);
              }
              if (child._strokeColorSignature) {
                self.applyStrokeColor(child, child._strokeColorSignature, filterSignature);
              }
              if (child._fillGradientSignature) {
                self.applyFillGradient(child, child._fillGradientSignature, null, filterSignature);
              }
            } while(child = child.nextSibling);

          })(element, element._filterSignature);
        }

        // Make sure `attr` is called after the draw methods because
        // the draw methods might add wrappers to the elements
        // (which we retrieve via `_root`)
        if (message.attributes) {
          svg.attr(element._root || element, message.attributes);
        }
      }
    }

    // align position
    for (parent in updateParents) {
      updateIds = updateParents[parent];
      tails = [];
      for (i = 0; (id = updateIds[i++]); ) {
        message = updateMessages[id];
        next = updateMessages[message.next];
        if (next) {
          next.prev = message;
        } else {
          tails.push(message);
        }
      }

      for (i = 0; (message = tails[i++]); ) {
        parent = svg[message.parent];
        if (parent) {
          prev = message.prev;
          element = svg[message.id];
          element = element._root || element;
          if (prev) { // consecutive elements to be inserted, use fragment
            if (!fragment) {
              // reuse the same fragment
              fragment = document.createDocumentFragment();
            }
            fragment.appendChild(element);
            do {
              next = element;
              element = svg[prev.id];
              element = element._root || element;
              fragment.insertBefore(element, next);
            } while ((prev = prev.prev));
            element = fragment;
          }
          parent.insertBefore(element, svg[message.next] || null);
        }
      }
    }

    this._logFrame();

    this.emit('canRender');
  };

  /* Presence of these methods required to ensure drawAll is called */
  proto.drawMovie = function() {};
  proto.drawGroup = function() {};

  /**
   * Called along with draw[Whatever].
   * Here we apply filters, clips etc.
   */
  proto.drawAll = function(type, element, message) {

    var attr = message.attributes;
    var filters = attr.filters;
    var fillColor = attr.fillColor;
    var fillGradient = attr.fillGradient;

    // when filter is applied, force fillColor change on UA w/o SVG Filter support
    if (!isFEColorMatrixEnabled && !fillColor && filters && element._fillColorSignature) {
      fillColor = element._fillColorSignature;
    }

    if (isArray(filters)) {
      // modify filters
      if (filters.length > 0) {
        this.applyFilters(element, filters);
      } else {
        this.removeFilters(element);
      }
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

      if (!(element._clip = this.svg[svgClipId])) {
        element._clip = this.svg[svgClipId] = this.svg.defs.appendChild(createElement('mask'));
        element._clip.id = this._genDefUID();
        element._clip._clipId = svgClipId; // Save real ID too (as in `this.svg`)
        element._clip.n = 1;
      } else {
        if (element._clip !== this.svg[svgClipId]) {
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
    //TODO: can't we set preserveAspectRatio only when `attributes.absoluteUrl != null`?
    img.setAttribute('preserveAspectRatio', 'none');

    var naturalWidth = attributes.naturalWidth;
    var naturalHeight = attributes.naturalHeight;

    var ratio = naturalHeight / naturalWidth;

    if (attributes.absoluteUrl != null) {
      img.setAttributeNS(xlink, 'href', attributes.absoluteUrl);
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

    var attributes = message.attributes;

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

    var attributes = message.attributes;

    if (attributes.selectable !== undefined) {
      if (attributes.selectable !== false) {
        cssClasses.add(text, 'selectable');
      } else {
        cssClasses.remove(text, 'selectable');
      }
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
    var volume;
    var attributes = message.attributes;
    var id = message.id;
    var videoElement = AssetController.assets[id];
    var playing = attributes.playing;

    if (typeof videoElement === 'undefined') {
      throw Error('asset <' + id + '> is unknown.');
    }

    // work-around: some browsers cannot transform the content of a foreignObject
    // e.g. webkit: http://code.google.com/p/chromium/issues/detail?id=87072
    // check http://double.co.nz/video_test/video.svg
    foreignObject.removeAttribute('transform');

    if ('matrix' in attributes) {
      foreignObject.setAttribute('x', attributes.matrix.tx);
      foreignObject.setAttribute('y', attributes.matrix.ty);
    }

    if ('width' in attributes) {
      foreignObject.setAttribute('width', attributes.width);
      videoElement.setAttribute('width', attributes.width);
    }
    if ('height' in attributes) {
      foreignObject.setAttribute('height', attributes.height);
      videoElement.setAttribute('height', attributes.height);
    }

    foreignObject.setAttribute('preserveAspectRatio', 'none');

    if (attributes.prepareUserEvent && 'ontouchstart' in document) {
      // We bind to the next touch-event and play/pause the audio to cause
      // iOS devices to allow subsequent play/pause commands on the audio el.
      // --
      // (Usually, iOS Devices will only allow play/pause methods to be called
      // after a user event. Due to bonsai's async nature, a movie programmer
      // can never achieve this. So we setup a fake one here...)
      var touchStartHandler = function() {
        videoElement.play();
        videoElement.pause();
        document.removeEventListener('touchstart', touchStartHandler, true);
      };
      document.addEventListener('touchstart', touchStartHandler, true);
    }

    if ('volume' in attributes) {
      // Value between 0-1. NaN is treated as `0`
      videoElement.volume = min(max(+attributes.volume || 0, 0), 1);
    }

    // Time in seconds. `currentTime` throws when there's no
    // current playback state machine
    if ('time' in attributes) {
      // Set volume to 0 to avoid "clicks"
      volume = videoElement.volume;
      videoElement.volume = 0;
      try {
        // Some browsers ignore `0`, that's why we set it to `0.01`
        videoElement.currentTime = +attributes.time || 0.01;
      } catch(e) {}
      // Set volume back to the initial value
      videoElement.volume = volume;
    }

    if (playing === true) {
      videoElement.play();
    }
    if (playing === false) {
      videoElement.pause();
    }

    videoElement.setAttribute('controls', 'controls');

    foreignObject.appendChild(videoElement);
  };

  proto.drawAudio = function(audioElement, message) {

    var volume;
    var attributes = message.attributes;
    var id = message.id;
    var playing = attributes.playing;

    if (typeof audioElement === 'undefined') {
      throw Error('asset <' + id + '> is unknown.');
    }

    if (attributes.prepareUserEvent && 'ontouchstart' in document) {
      // We bind to the next touch-event and play/pause the audio to cause
      // iOS devices to allow subsequent play/pause commands on the audio el.
      // --
      // (Usually, iOS Devices will only allow play/pause methods to be called
      // after a user event. Due to bonsai's async nature, a movie programmer
      // can never achieve this. So we setup a fake one here...)
      var touchStartHandler = function() {
        audioElement.play();
        audioElement.pause();
        document.removeEventListener('touchstart', touchStartHandler, true);
      };
      document.addEventListener('touchstart', touchStartHandler, true);
    }

    if ('volume' in attributes) {
      // Value between 0-1. NaN is treated as `0`
      audioElement.volume = min(max(+attributes.volume || 0, 0), 1);
    }

    // Time in seconds. `currentTime` throws when there's no
    // current playback state machine
    if ('time' in attributes) {
      // Set volume to 0 to avoid "clicks"
      volume = audioElement.volume;
      audioElement.volume = 0;
      try {
        // Some browsers ignore `0`, that's why we set it to `0.01`
        audioElement.currentTime = +attributes.time || 0.01;
      } catch(e) {}
      // Set volume back to the initial value
      audioElement.volume = volume;
    }

    if (playing === true) {
      audioElement.play();
    }
    if (playing === false) {
      audioElement.pause();
    }

  };

  proto.drawDOMElement = function(element, message) {

    // assuming a valid assetId
    var body,
        attributes = message.attributes,
        parent = this.svg[message.parent];

    // Parent may not be defined if message is a NeedsDraw and *not* a NeedsInsertion
    if (parent && !element._root && !(parent instanceof HTMLElement)) {
      // If the element is a top-level HTML element it needs to be wrapped
      // in <foreignObject><body>...</body></foreignObject>
      body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');
      element._root = createElement('foreignObject', message.id);
      element._root.appendChild(body);
      body.appendChild(element);
      element._root.setAttribute('width', '100%');
      element._root.setAttribute('height', '100%');
    }

    if (element._root) {
      // Make sure top-level DOM element's width and height are applied
      // to the containing <foreignObject>. We don't want the <foreignObject>
      // to be any bigger than it has to be.
      if ('css_width' in attributes && /px$/.test(attributes.css_width)) {
        element._root.setAttribute('width', attributes.css_width);
      }
      if ('css_height' in attributes && /px$/.test(attributes.css_height)) {
        element._root.setAttribute('height', attributes.css_height);
        // Save height for the forced repaint below:
        element._root._height = attributes.css_height;
      }
    }

    // Mark the element as one with a corresponding BS DOMElement object
    element._isBSDOMElement = true;

    for (var i in attributes) {
      if (/^dom_/.test(i)) {
        if (i === 'dom_innerHTML') {
          element.innerHTML = (attributes[i] || '').replace(/\{\{prefix\}\}/g, fontPrefix);
        } else {
          element.setAttribute(i.slice(4), attributes[i]);
        }
      } else if(/^css_/.test(i) && attributes[i] != null) {
        element.style[i.slice(4)] = attributes[i].toString().replace(/\{\{prefix\}\}/g, fontPrefix);
      }
    }

    // If we're mutating innerHTML and its already in the DOM, it needs a
    // forced repaint: (TODO: only do this for Chrome)
    if ('dom_innerHTML' in attributes && element.parentNode) {
      var cur = element, root = element._root;
      if (!root) {
        // Find root <foreignObject>
        while (cur = cur.parentNode) {
          if (root = cur._root) {
            break;
          }
        }
      }
      root.setAttribute('height', root._height || '100%');
    }

  };

  proto.removeObject = function(element) {

    var rootElement = element._root || element,
        parent = rootElement.parentNode;

    if (parent) {
      parent.removeChild(rootElement);
    }

    if (element._pattern) {
      this.removeFillImage(element);
      this.svg.defs.removeChild(element._pattern);
      element._pattern._fillGradientSignature &&
        this.removeGradient(element._pattern, 'fill');
    }

    element._fillGradientSignature &&
      this.removeGradient(element, 'fill');

    element._strokeGradientSignature &&
      this.removeGradient(element, 'stroke');

    this.removeMask(element);
    this.removeFilters(element);
  };

  proto.removeFilters = function(element) {

    // TODO: reset color in respect to filter-shim

    var signature = element._filterSignature,
        def = this.definitions[signature];

    // return early when no filter was previously applied
    if (!def) {
      return;
    }

    if (def.n > 1) {
      def.n--;
    } else {
      this.svg.defs.removeChild(def.element);
      delete this.definitions[signature];
    }

    // remove filter-attribute and internal filter-reference
    element.removeAttribute('filter');
    delete element._filterSignature;
  };

  proto.removeFillImage = function(element) {
    var pattern = element._pattern;
    if (pattern && pattern._fillImage) {
      pattern.removeChild(pattern._fillImage);
      delete this.svg[pattern._fillImage._fillImageId];
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
      this.svg.defs.removeChild(def.element);
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
        this.svg.defs.removeChild(clip);
        delete this.svg[clip._clipId];
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
        this.svg.defs.removeChild(mask);
        delete this.svg[mask._maskId];
      }
      element.removeAttribute('mask');
      delete element._mask;
    }
  };

  proto.destroy = function() {
    var svg = this.svg;
    // remove event listeners
    eventTypes.forEach(function(e) {
      svg.root.removeEventListener(e, this, false);
    }, this);

    // remove key listeners
    document.removeEventListener('keyup', this, false);
    document.removeEventListener('keydown', this, false);
    document.removeEventListener('keypress', this, false);

    // stop fps interval
    clearInterval(this._fpsInterval);

    svg.root.parentNode && svg.root.parentNode.removeChild(svg.root);
    delete this.svg;
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
   * @param {String} [filterSignature]
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
          gradientEl = createElement('linearGradient');
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
          stopEl = createElement('stop');
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
          gradientEl = createElement('radialGradient');
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
          stopEl = createElement('stop');
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

    this.svg.defs.appendChild(gradientEl);
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
        svg = this.svg,
        defs = svg.defs,
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
    svg.root.appendChild(element);

    if (isNewPattern) {

      boundingBox = element.getBBox();

      // group
      group = (function createGroup(id, dict, aBoundingBox, aMatrix) {
        var aGroup = createElement('g', id);
        dict[id] = aGroup;
        aMatrix.tx += aBoundingBox.x;
        aMatrix.ty += aBoundingBox.y;
        aGroup.setAttribute('transform', matrixToString(aMatrix));
        return aGroup;
      })(message.id, svg, boundingBox, attributes.matrix);

      // create a mask node and append it to the <defs> section
      mask = (function createMask(aGroup, id, defsNode) {
        var mask = createElement('mask');
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
      patternFillImage = group._fillImage = createElement('g');
      patternFillImage._fillImageId = attributes.fillImageId + '_offStageParent';
      svg[patternFillImage._fillImageId] = patternFillImage;
    }

    if (!patternFillGradient && fillGradient) {
      boundingBox || (boundingBox = element.getBBox());
      patternFillGradient = group._fillGradient = createElement('rect');
      patternFillGradient.setAttribute('x', 0);
      patternFillGradient.setAttribute('y', 0);
      patternFillGradient.setAttribute('width', boundingBox.width);
      patternFillGradient.setAttribute('height', boundingBox.height);
    }

    if (fillColor) {
      patternFillColor = group._fillColor = createElement('rect');
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

  };

  proto.applyFills = function(element, attributes) {

    // Apply both fills, color under gradient and/or image:
    // Use a pattern to contain fills

    var boundingBox,
        elementMatrix,
        svg = this.svg,
        defs = svg.defs,
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

    this.svg.root.appendChild(element);

    if (isNewPattern) {

      boundingBox = element.getBBox();

      pattern = element._pattern = createElement('pattern');
      patternFillColor = pattern._fillColor = createElement('rect');

      pattern.setAttribute('patternUnits', 'userSpaceOnUse');
      pattern.setAttribute('x', 0);
      pattern.setAttribute('y', 0);
      pattern.setAttribute('width', boundingBox.width / fillRepeatX);
      pattern.setAttribute('height', boundingBox.height / fillRepeatY);
      elementMatrix = tools.mixin({}, attributes.matrix);
      elementMatrix.tx = boundingBox.x;
      elementMatrix.ty = boundingBox.y;
      pattern.setAttribute('patternTransform', matrixToString(elementMatrix));

      patternFillColor.setAttribute('x', 0);
      patternFillColor.setAttribute('y', 0);
      patternFillColor.setAttribute('width', boundingBox.width / fillRepeatX);
      patternFillColor.setAttribute('height', boundingBox.height / fillRepeatY);
    }

    if (!patternFillGradient && fillGradient) {
      boundingBox || (boundingBox = element.getBBox());
      patternFillGradient = pattern._fillGradient = createElement('rect');
      patternFillGradient.setAttribute('x', 0);
      patternFillGradient.setAttribute('y', 0);
      patternFillGradient.setAttribute('width', boundingBox.width / fillRepeatX);
      patternFillGradient.setAttribute('height', boundingBox.height / fillRepeatY);
    }

    if (!patternFillImage && attributes.fillImageId) {
      patternFillImage = pattern._fillImage = createElement('g');
      patternFillImage._fillImageId = attributes.fillImageId + '_offStageParent';
      this.svg[patternFillImage._fillImageId] = patternFillImage;
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

    // remove already applied filters
    this.removeFilters(element);

    var filterContainer = createElement('filter');

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

    this.svg.defs.appendChild(filterContainer);
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
    var dictionary = this.svg;

    if (!(element._mask = dictionary[maskId])) {
      element._mask = dictionary[maskId] = dictionary.defs.appendChild(createElement('mask'));
      element._mask.id = this._genDefUID();
      element._mask._maskId = maskId; // Save real ID too (as in `this.svg`)
      element._mask.n = 1;
    } else {
      if (element._mask !== dictionary[maskId]) {
        element._mask.n++;
      }
    }
    element.setAttribute('mask', 'url(#' + element._mask.id + ')');
  }

  proto.getOffset = function() {

    // We query the bounding box of the rootContainer instead of the root
    // (i.e. the parent DIV). This is due to an issue with getting the offset
    // of an SVGElement on iOS devices (unreliable).

    var ctm,
        offset = this.svg.rootContainer.getBoundingClientRect();

    if (isNaN(offset.left) || isNaN(offset.top)) {
      ctm = this.svg.rootContainer.getScreenCTM();
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

  SvgRenderer.Svg = Svg;

  return SvgRenderer;
});
