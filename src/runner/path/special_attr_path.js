define(['./path', '../../tools'], function(Path, tools) {

  function makeAccessor(attrName, defaultValue) {
    var value = defaultValue;
    function set(newValue) {
      value = newValue;
      if (!this._owner._isProcessingPathAttribute) {
        this._owner._isProcessingPathAttribute = true;
        this._owner.clear();
        this._owner._make();
        this._owner._isProcessingPathAttribute = false;
      }
    }
    function get() {
      return value;
    }
    return tools.descriptorAccessor(get, set, true);
  }

  /**
   * Creates a SpecialAttrPath
   *
   * @constructor
   * @classdesc SpecialAttrPath directly subclasses Path and provides a convenience
   *  argument for adding special attributes for unique shape types. Intended to
   *  be inherited from for custom path classes. E.g. Star, Rect etc.
   * @name SpecialAttrPath
   * @memberOf module:path
   * @extends module:path.Path
   * @param {Object} specialAttributes A map of attributes with their default
   *  values. Setters/getters will automatically be set-up, and path-redrawing
   *  will happen automatically.
   */
  function SpecialAttrPath(specialAttributes) {

    Path.call(this);

    this._isProcessingPathAttribute = false;

    for (var attrName in specialAttributes) {
      Object.defineProperty(
        this._attributes,
        attrName,
        makeAccessor(attrName, specialAttributes[attrName])
      );
    }

  }

  /** @lends module:path.SpecialAttrPath.prototype **/
  var proto = SpecialAttrPath.prototype = Object.create(Path.prototype);

  var attrMethod = Path.prototype.attr;

  /**
   * SpecialAttrPath overrides Path#attr so it can manage the re-making of the path
   * on each bulk attr call. (i.e. calling `clear()` and `_make()`).
   *
   * @ignore
   */
  proto.attr = function(attr, val) {

    var argLength = arguments.length;

    if (!this._isProcessingPathAttribute && argLength === 1 && typeof attr !== 'string') {
      // Prevent path from being redrawn until we've finished
      // going through the entire map of attributes:
      this._isProcessingPathAttribute = true;
      attrMethod.call(this, attr);
      this.clear();
      this._make();
      this._isProcessingPathAttribute = false;
      return this;
    }
    return attrMethod.apply(this, arguments);
  };

  /**
   * You cannot morph a SpecialAttrPath.
   * Doing so would mean transforming e.g. A Star instance to a Rect instance.
   * The transformation of properties (e.g. radius, rays, width, height) is not
   * easily defined so it's better to avoid the matter completely.
   * If a user wants to morph then they must utilise Path directly and draw
   * their shapes manually.
   *
   * @ignore
   */
  proto.morphTo = function() {
    throw Error('SpecialAttrPath\'s are not morphable');
  }

  /**
   * Generates shape as per SpecialAttrPath's properties in _attributes
   * (is meant to be overriden)
   *
   * @private
   */
  proto._make = function() {};

  return SpecialAttrPath;

});
