define([
  '../event_emitter',
  '../tools',
  './matrix',
  '../point',
  './animation/animation',
  './animation/keyframe_animation',
  './filter/builtin'
], function(
  EventEmitter, tools, Matrix, Point, Animation,
  KeyframeAnimation, filter
) {
  'use strict';

  var accessor = tools.descriptorAccessor, data = tools.descriptorData;
  var getter = tools.getter;

  /**
   * @type {number} Unique id counter. Every display object gets a unique id.
   */
  var uid = 1;

  var atan2 = Math.atan2, PI = Math.PI;
  var isfinite = isFinite; // local reference for faster lookup

  function getRotation() {
    var matrix = this._matrix;
    var a = atan2(matrix.b, matrix.a);
    var b = -atan2(matrix.c, matrix.d);
    //return (a > b ? a : b) / PI * 180; // degrees
    return a > b ? a : b; // radians
  }

  function setRotation(rotation) {
    if (isfinite(rotation)) {
      // rotation = (+rotation % 360) || 0; // degrees
      rotation = (+rotation % (2 * PI)) || 0; // radians
      var matrix = this._matrix;

      // rotate around transform origin
      var origin = this.origin;
      var rotatedOrigin = matrix.transformPoint(origin);
      var tx = rotatedOrigin.x, ty = rotatedOrigin.y;

      matrix.tx -= tx;
      matrix.ty -= ty;

      // matrix.rotate((rotation - this.rotation) * PI / 180); // radians
      matrix.rotate(rotation - this.rotation); // degrees

      matrix.tx += tx;
      matrix.ty += ty;

      this._owner._mutatedAttributes.matrix = true;
    }
  }

  function getMatrix() {
    var o;
    var m = this._matrix.clone(), sx = this._scaleX, sy = this._scaleY;
    if (sx !== 1 || sy !== 1) {
      // Make sure we rotate around the chosen origin
      o = m.transformPoint(this._origin);
      m.tx -= o.x;
      m.ty -= o.y;
      m.scale(sx, sy);
      m.tx += o.x;
      m.ty += o.y;
    }

    return m;
  }

  function setMatrix(matrix) {
    var m = this._matrix;
    m.a = matrix.a;
    m.b = matrix.b;
    m.c = matrix.c;
    m.d = matrix.d;
    m.tx = matrix.tx;
    m.ty = matrix.ty;
  }

  function getX() {
    return this.matrix.tx;
  }

  function setX(x) {
    if (isfinite(x)) {
      var s = this._scaleX;
      if (s === 1) {
        this._matrix.tx = x;
      } else {
        this._matrix.tx += x - this.matrix.tx;
      }
      this._owner._mutatedAttributes.matrix = true;
    }
  }

  function getY() {
    return this.matrix.ty;
  }

  function setY(y) {
    if (isfinite(y)) {
      var s = this._scaleY;
      if (s === 1) {
        this._matrix.ty = y;
      } else {
        this._matrix.ty += y - this.matrix.ty;
      }
      this._owner._mutatedAttributes.matrix = true;
    }
  }

  function getScaleX() {
    return this._scaleX;
  }

  function setScaleX(scale) {
    if (isfinite(scale)) {
      this._scaleX = +scale;
      this._owner._mutatedAttributes.matrix = true;
    }
  }

  function getScaleY() {
    return this._scaleY;
  }

  function setScaleY(scale) {
    if (isfinite(scale)) {
      this._scaleY = +scale;
      this._owner._mutatedAttributes.matrix = true;
    }
  }

  function getScale() {
    // Get avg of both scales
    return (this.scaleX + this.scaleY) / 2;
  }

  function setScale(scale) {
    this.scaleX = this.scaleY = scale;
  }

  var getOpacity = getter('_opacity');
  function setOpacity(opacity) {
    this._opacity = opacity > 1 ? 1 : (opacity < 0 ? 0 : +opacity);
  }

  function getOrigin() {
    return this._origin.clone();
  }
  function setOrigin(origin) {
    var o = this._origin;
    o.x = origin.x;
    o.y = origin.y;
  }

  function getCursor() {
    return this._cursor;
  }
  function setCursor(cursor) {
    if (!cursor) {
      this._cursor = null;
    } else if (/^(?:default|pointer|wait|progress)$/.test(cursor)) {
      this._cursor = cursor;
    }
  }

  function getFilters() {
    // Returning the originals for now, gotta see if we run into issues
    // with this approach.
    return this._filters.slice(0);
  }

  function setFilters(args) {

    if (!args) {
      this._filters.length = 0;
      return;
    }

    var filters = [].concat(args);
    filters = filters.map(function(filterArgs) {
      return filterArgs instanceof filter.BaseFilter ? filterArgs : new filter[filterArgs]();
    });

    this._filters = filters;
  }

  function setClip(clip) {

    // TODO: Clip cleanup (when a clip is no longer applied)

    var owner = this._owner;

    owner._mutatedAttributes.clipId = true;

    if (!clip) {
      this._clip && DisplayObject.unregisterOffStageObj(owner, this._clip);
      this._clip = null;
      this._clipId =  null;
      return;
    }

    if (clip.stage && !clip._isOffStage) {
      throw Error('You cannot set a clip that has been previously added to the stage');
    }

    if (!('composeRenderMessage' in clip)) {
      throw Error('Not a valid clip element');
    }

    if (owner.stage) {
      DisplayObject.registerOffStageObj(owner, clip, owner.stage, 'clip');
    }

    this._clipId = clip.id;
    this._clip = clip;
  }
  function getClip() {
    return this._clip;
  }

  function setMask(mask) {

    var owner = this._owner;

    owner._mutatedAttributes.maskId = true;

    if (!mask) {
      this._mask && DisplayObject.unregisterOffStageObj(owner, this._mask);
      this._mask = null;
      this._maskId =  null;
      return;
    }

    if (mask.stage && !mask._isOffStage) {
      throw Error('You cannot set a mask that has been previously added to the stage');
    }

    if (!('composeRenderMessage' in mask)) {
      throw Error('Not a valid mask');
    }

    if (owner.stage) {
      DisplayObject.registerOffStageObj(owner, mask, owner.stage, 'mask');
    }

    this._maskId = mask.id;
    this._mask = mask;
  }
  function getMask() {
    return this._mask;
  }

  /**
   * The DisplayObject constructor. It's the base class for everything
   * that's displayable.
   *
   * @constructor
   * @name DisplayObject
   * @mixes EventEmitter
   * @property {number} id The unique id of the DisplayObject instance.
   *
   * @property {__list__} __supportedAttributes__ List of supported attribute names.
   *    These are the attribute names you can pass to the attr() method. Note
   *    that this property is not available in your code, it's just here for
   *    documentation purposes.
   * @property {module:matrix.Matrix} __supportedAttributes__.matrix The transformation matrix
   * @property {number} __supportedAttributes__.opacity The opacity of the object.
   * @property {number} __supportedAttributes__.origin The transformation origin
   * @property {number} __supportedAttributes__.rotation The rotation in radians
   * @property {number} __supportedAttributes__.scale (Setter only) Sets scaleX and scaleY
   * @property {number} __supportedAttributes__.scaleX The scale applied to the x-axis.
   * @property {number} __supportedAttributes__.scaleY The scale applied to the y-axis.
   * @property {number} __supportedAttributes__.x Sets the matrix offset on the x-axis.
   * @property {number} __supportedAttributes__.y Sets the matrix offset on the y-axis.
   * @property {array} __supportedAttributes__.filters The list of filters applied to the DisplayObject
   *
   */
  function DisplayObject() {
    Object.defineProperty(this, 'id', {value: uid++});
    this._attributes = Object.create(null, {
      _owner: data(this),
      _matrix: data(new Matrix()),
      matrix: accessor(getMatrix, setMatrix, true),
      _filters: data([], true),
      filters: accessor(getFilters,setFilters, true),
      interactive: data(true, true),
      _opacity: data(1, true),
      opacity: accessor(getOpacity, setOpacity, true),
      _origin: data(new Point()),
      origin: accessor(getOrigin, setOrigin, true),
      rotation: accessor(getRotation, setRotation, true),
      _scaleX: data(1, true),
      _scaleY: data(1, true),
      scale: accessor(getScale, setScale, true),
      scaleX: accessor(getScaleX, setScaleX, true),
      scaleY: accessor(getScaleY, setScaleY, true),
      x: accessor(getX, setX, true),
      y: accessor(getY, setY, true),
      clip: accessor(getClip, setClip, true),
      _clip: data(null, true),
      _clipId: data(null, true),
      mask: accessor(getMask, setMask, true),
      _mask: data(null, true),
      _maskId: data(null, true),
      cursor: accessor(getCursor, setCursor, true),
      _cursor: data(null, true),
      fillRule: data('inherit', true),
      visible: data(true, true)
    });

    this._isOffStage = false;

    this._renderAttributes = {
      matrix: 'matrix',
      filters: '_filters',
      opacity: '_opacity',
      clipId: '_clipId',
      maskId: '_maskId',
      cursor: '_cursor',
      fillRule: 'fillRule',
      visible: 'visible',
      interactive: 'interactive'
    };

    /*
      _mutatedAttributes tracks changes between each call to composeRenderMessage
      (used for optimising what attributes are sent to the renderer)
      We set it to all render-attributes originally:
    */
    this._mutatedAttributes = tools.mixin({}, this._renderAttributes);
  }

  /**
   * Register display objects without having to add them
   * to a stage (this is what we want for masks)
   */
  DisplayObject.registerOffStageObj = function(subject, obj, stage, type, isChild) {
    if (!stage) {
      return;
    }

    obj.stage = stage;
    obj._offStageType = type;
    obj._isOffStage = true;

    stage.registry.needsDraw[obj.id] = obj;
    stage.registry.needsInsertion[obj.id] = obj;
    stage.registry.displayObjects[obj.id] = obj;

    // Add submovie to movies registry so that it is "advanced" with all
    // other sub-movies in stage#loop
    if (obj.type === 'Movie') {
      stage.registry.movies.add(obj);
    }
    // Note: Current impl. of clip/mask relies on this (e.g. sub-clip applied to off-stage mask)

    if (!isChild) {
      obj.parent = stage;
      obj._offStageUseCount = obj._offStageUseCount ? obj._offStageUseCount + 1 : 1;
      subject.once('removedFromStage', function() {
        // Only unregister offStage object if it's not used anywhere else
        if (obj._offStageUseCount === 1) {
          DisplayObject.unregisterOffStageObj(subject, obj, true);
        } else {
          obj._offStageUseCount--;
        }
      });
    }

    obj._activate(stage);

    // We need to ensure that all children are registered as off-stage objects
    // (this includes adding them to the registry!)

    var children = obj.displayList && obj.displayList.children;
    if (children) {
      for (var i = 0, l = children.length; i < l; ++i) {
        var child = children[i];
        if (child) {
          DisplayObject.registerOffStageObj(subject, child, stage, type, true);
        }
      }
    }
  };

  /**
   * Unregister off-stage display objects
   */
  DisplayObject.unregisterOffStageObj = function(subject, obj, isChild) {

    // If this is a top-level offStage object, and it's not used anywhere else
    // then we can continue unregistering it:
    if (!isChild) {
      if (--obj._offStageUseCount > 0) {
        return;
      }
      delete obj._offStageUseCount;
    }

    var stage = obj.stage;

    if (stage) {
      obj.emit('removedFromStage');

      stage.registry.needsDraw[obj.id] = obj; // Stage must see it (for deletion)
      delete stage.registry.needsInsertion[obj.id];
      delete stage.registry.displayObjects[obj.id];
      delete obj.stage;

      obj.markUpdate('shapeData');

      delete obj._offStageType;
      obj._isOffStage = false;

      var children = obj.displayList && obj.displayList.children;
      if (children) {
        for (var i = 0, l = children.length; i < l; ++i) {
          var child = children[i];
          if (child) {
            DisplayObject.unregisterOffStageObj(subject, child, true);
          }
        }
      }
    }
  };

  var proto = DisplayObject.prototype = /** @lends DisplayObject */ {

    /**
     * The display list this display object is part of.
     *
     * @type {DisplayList|null}
     */
    parent: null,

    /**
     * The type of the given instance.
     *
     * This is used to send as part of the render message.
     * Each inheriting primitive must override this.
     */
    type: 'DisplayObject',

    /**
     * To be called by the parent when adding a display object or one of its
     * ancestors to the stage
     */
    _activate: function(stage) {
      this.stage = stage;

      // When the item is added from the stage make sure the
      // mutatedAttributes are set to ALL renderAttributes so it's
      // ensured all attributes are sent to the renderer:
      this._mutatedAttributes = tools.mixin({}, this._renderAttributes);

      var attributes = this._attributes;
      // Make sure we change the mask's stage whenever
      // this displayObject's stage changes:
      var clip = attributes._clip;
      if (clip) {
        DisplayObject.registerOffStageObj(this, clip, stage, 'clip');
      }


      // Make sure we change the mask's stage whenever
      // this displayObject's stage changes:
      var mask = attributes._mask;
      if (mask) {
        DisplayObject.registerOffStageObj(this, mask, stage, 'mask');
      }

      // If this instance is a child of an off-stage object then we should
      // mark it us an off-stage object too.
      if (this.parent._isOffStage) {
        this._offStageType = this.parent._offStageType;
        this._isOffStage = true;
      }

      var registry = stage.registry;
      registry.displayObjects[this.id] = this;
      registry.needsInsertion[this.id] = this;
      this.markUpdate();

      this.emit('addedToStage');
    },

    /**
     * To be called by the parent when removing a display objector one of its
     * ancestors from the stage.
     */
    _deactivate: function() {
      var stage = this.stage;
      if (stage) {
        var registry = stage.registry;
        var id = this.id;
        this.stage = void 0;
        registry.needsDraw[id] = this;
        delete registry.displayObjects[id];
        delete registry.needsInsertion[id];
      }
      this.emit('removedFromStage');
    },

    /**
     * Sets or gets an attribute / multiple attributes on / from the object.
     *
     * When called without parameters: returns an object with all attributes as
     * key / value pairs.
     *
     * When called with one parameter: if parameter is an object, sets all
     * properties as attributes on the instance. Gets an attribute otherwise.
     *
     * When called with two parameters: Sets a single attribute to a value.
     *
     *
     *
     * @example
     * o.attr('foo', 1); // sets the 'foo' attribute
     * o.attr('foo'); // gets the 'foo' attribute
     * o.attr({foo: 1, bar: 'baz'}); // sets the 'foo' and 'bar' attributes
     * o.attr(); // gets all attributes
     *
     * Supported attributes are:
     *
     *  - matrix: {module:matrix.Matrix}
     *  - opacity: {number}
     *  - origin: {number}
     *  - rotation: {number}
     *  - scale: {number}
     *  - scaleX: {number}
     *  - scaleY: {number}
     *  - x: {number}
     *  - y: {number}
     *
     * @param {string|Object} [attr] If string: single attribute mode. If
     *    object, sets multiple attributes from the object properties.
     * @param {mixed} [value] If `attr` parameter is string: Sets the attribute
     *    to this value.
     * @returns {this|mixed} The instance if setting, else attribute value(s).
     */
    attr: function(attr, value) {
      var copy,
          name,
          hasChange = false,
          attributes = this._attributes;

      switch (arguments.length) {
        case 0: // return all attributes
          copy = {};
          for (name in attributes) {
            if (name.charAt(0) != '_') {
              copy[name] = attributes[name];
            }
          }
          return copy;

        case 1: // return one attribute or set attributes from an object
          if (typeof attr == 'string') {
            return attr in attributes && attr.charAt(0) != '_' ?
              attributes[attr] : void 0;
          }
          for (name in attr) {
            value = attr[name]; // value parameter is unused in this branch
            if (name in attributes && name.charAt(0) != '_' && attributes[name] !== value) {
              attributes[name] = value;
              hasChange = this._mutatedAttributes[name] = true;
            }
          }
          break;

        case 2: // set at single attribute
          if (attr in attributes && attr.charAt(0) != '_' && attributes[attr] !== value) {
            attributes[attr] = value;
            hasChange = this._mutatedAttributes[attr] = true;
          }
          break;
      }
      if (hasChange) {
        this.markUpdate();
      }
      return this;
    },

    /**
     * Gets the matrix of the DisplayObject combined with all ancestor matrices
     *
     * @returns {Matrix} The resulting matrix
     */
    getAbsoluteMatrix: function() {
      var matrix = this.attr('matrix').clone();
      var parent = this;
      while ((parent = parent.parent) && parent.id !== 0) {
        matrix.concat(parent.attr('matrix'));
      }
      return matrix;
    },

    /**
     * Computed the absolute bounding box relative to the top-most ancestor
     *
     * @returns {Object} an object with all box properties
     *  (left, top, right, bottom, width, height)
     */
    getAbsoluteBoundingBox: function() {
      return this.getBoundingBox( this.getAbsoluteMatrix() );
    },

    /**
     * Computes bounding boxes and single data points of a display object.
     *
     * @param {Matrix} [transform=null] A transform to apply to all points
     *    before computation.
     * @returns {Object} an object with all box properties
     *  (left, top, right, bottom, width, height)
     */
    getBoundingBox: function(transform) {
      var x = 0, y = 0;
      if (transform) {
        var transformed = transform.transformPoint({x: 0, y: 0});
        x = transformed.x;
        y = transformed.y;
      }
      return {
        top: y,
        right: x,
        bottom: y,
        left: x,
        width: 0,
        height: 0
      };
    },

    /**
     * Destroys a child: removes it from the parent and removes all listeners.
     *
     * @returns {this} The instance
     */
    destroy: function() {
      return this.
        emit('destroy', this). // do before removing the listeners ;)
        removeAllListeners().
        remove();
    },

    /**
     * Gets or sets the mask for the display object.
     *
     * If called with parameter, the mask is set. When called without
     * parameter, the currently used mask is returned.
     *
     * Call the method with null or undefined as parameter to unset the mask.
     *
     * @param {DisplayObject|null} [mask] The mask to apply to the instance
     * @returns {this|DisplayObject|null} the instance if called with
     *    parameter, else the mask in use.
     */
    mask: function(mask) {

    },

    /**
     * Gets or sets the blend mode for the display object.
     *
     * If called with parameter, the blendMode is set. When called without
     * parameter, the currently used blendMode is returned.
     *
     * Call the method with null or undefined as parameter to reset the
     * to its default blendMode (normal).
     *
     * @param {String|null} [blendMode] The blendMode to apply to the instance
     * @returns {this|DisplayObject|null} the instance if called with
     *    parameter, else the blendMode in use.
     */
    blendMode: function(blendMode) {

    },

    /**
     * Marks the current instance for an update
     *
     */
    markUpdate: function() {
      var stage = this.stage;
      if (stage) {
        stage.registry.needsDraw[this.id] = this;
      }
      return this;
    },

    /**
     * Adds this instance to a parent on top
     * of all parent's children.
     *
     * @param {DisplayList} parent
     * @returns {this}
     */
    addTo: function(parent, index) {
      if (arguments.length === 1) {
        parent.addChild(this);
      } else {
        parent.addChild(this, index);
      }
      return this;
    },

    /**
     * Adds this instance to the reference object's
     * parent right after the reference object.
     *
     * NOTE: The passed reference object must be already added
     * for this method to work.
     *
     * @param {DisplayObject} sibling
     * @returns {this}
     */
    addAfter: function(sibling) {
      var parent = sibling.parent;
      parent.addChild(this, parent.getIndexOfChild(sibling) + 1);
      return this;
    },

    /**
     * Adds this instance to the reference object's
     * parent right before the reference object.
     *
     * NOTE: The passed reference object must be already added
     * for this method to work.
     *
     * @param {DisplayObject} sibling
     * @returns {this}
     */
    addBefore: function(sibling) {
      var parent = sibling.parent;
      parent.addChild(this, parent.getIndexOfChild(sibling));
      return this;
    },

    /**
     * Detaches a child from its parent
     *
     * @param {String} [removalStrategy='changeIndexes'] In default mode
     *  ('changeIndexes'), no gaps are left in the display list.
     *  If 'keepIndexes' is passed, the child will simply be deleted from the
     *  children array, leaving a gap.
     * @returns {this} The instance
     */
    remove: function(removalStrategy) {
      var parent = this.parent;
      if (parent) {
        parent.removeChild(this, removalStrategy);
      }
      return this;
    },

    /**
     * Sets the origin attribute of the instance.
     *
     * @todo Add support for sugar like 'center'
     *
     * @param {number} x
     * @param {number} y
     * @return {this} The instance
     */
    setOrigin: function(x, y) {
      return this.attr('origin', {x: x, y: y});
    },

    /**
     * Composes a message for the renderer
     *
     * @returns {object} The message
     */
    composeRenderMessage: function(message) {

      message || (message = {attributes: {}, id: this.id});
      var attributes = message.attributes || {},
          mutatedAttributes = this._mutatedAttributes,
          renderAttributes = this._renderAttributes,
          values = this._attributes;

      for (var key in mutatedAttributes) {
        if (key in renderAttributes) {
          attributes[key] = values[renderAttributes[key]];
        }
      }

      this._mutatedAttributes = {};
      message.attributes = attributes;
      message.data = this._getRenderData && this._getRenderData();
      message.type = this.type;
      message.offStageType = this._offStageType;

      return message;
    },

    /**
     * Animates object by specified properties
     *
     * @param {Number|String} duration The duration, either as frames (number),
     *  seconds (e.g. '1s'), milliseconds (e.g. '100ms') or as a percentage
     *  of the clock's total frames (e.g. '23%')
     * @param {Object} properties The properties/values to animate
     * @param {Object} [options] Additional options
     * @param {String|Function} [options.easing] Easing function. Either the name
     *  of a predefined or a custom function
     * @param {Number|String} [options.delay=0] Delay before animation begins, in
     *  frames or seconds
     * @param {Number} [options.repeat=0] The number of repetitions.
     * @returns {this} the instance
     */
    animate: function(duration, properties, options) {
      var animation = duration;
      if (/number|string/.test(typeof duration) || !(animation instanceof Animation || animation instanceof KeyframeAnimation)) {
        var clock = options && options.clock || this.stage;
        options || (options = {});
        if (!clock) { // not in the display list -- try to find parent timeline
          clock = this;
          while (clock && !clock.emitFrame /* not timeline */) {
            clock = clock.parent;
          }
        }
        if (!clock) {
          // We haven't found a clock (obj probably isn't onstage)
          this.once('addedToStage', function() {
            // Re-call `.animate()` when the object is added to the stage:
            this.animate(duration, properties, options);
          });
          return this;
        }
        animation = new Animation(clock, duration, properties, options);
      }

      animation.addSubject(this).play();
      return this;
    }
  };

  tools.mixin(proto, EventEmitter);

  return DisplayObject;
});
