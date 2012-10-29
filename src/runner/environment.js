define([
  '../tools',
  '../event_emitter',
  './movie',
  '../point',
  './path/path',
  './path/special_attr_path',
  './path/rect',
  './path/polygon',
  './path/star',
  './path/ellipse',
  './path/circle',
  './path/arc',
  './bitmap',
  './display_object',
  './group',
  './animation/animation',
  './animation/keyframe_animation',
  './animation/easing',
  './font_family',
  './matrix',
  './sprite',
  '../color',
  './gradient',
  './text',
  './text_span',
  './audio',
  './video',
  './filter/builtin',
  './display_list',
  './dom_element',
  '../version'
], function(
  tools, EventEmitter, Movie, Point,
  Path, SpecialAttrPath, Rect, Polygon, Star, Ellipse, Circle, Arc,
  Bitmap, DisplayObject, Group,
  Animation, KeyframeAnimation, easing, FontFamily, Matrix,
  Sprite, color, gradient, Text, TextSpan, Audio, Video, filter,
  displayList, DOMElement, version
) {
  'use strict';

  function bindConstructorToParameters(Constructor, parameters) {
    var numFixedParams = parameters.length;
    parameters = parameters.slice();
    function BoundConstructor() {
      parameters.length = numFixedParams;
      parameters.push.apply(parameters, arguments);
      return Constructor.apply(this, parameters);
    }
    BoundConstructor.prototype = Constructor.prototype;

    return BoundConstructor;
  }

  /**
   * Provides an environment / namespace for individual bonsai scripts/movies
   *
   * @param {Stage} stage The root stage object
   * @param {AssetLoader} assetLoader A loader for assets
   */
  function Environment(stage, assetLoader) {

    var exports = this.exports = {

      // DisplayObjects
      DOMElement: DOMElement,
      DisplayObject: DisplayObject,
      Group: Group,
      Matrix: Matrix,
      Text: Text,
      TextSpan: TextSpan,

      // Path Classes
      Path: Path,
      SpecialAttrPath: SpecialAttrPath,
      Rect: Rect,
      Polygon: Polygon,
      Star: Star,
      Ellipse: Ellipse,
      Circle: Circle,
      Arc: Arc,

      DisplayList: displayList.DisplayList,

      Point: Point,
      color: color,
      tools: tools,
      gradient: gradient,
      easing: easing,
      filter: filter,
      stage: stage,
      version: version
    };

    this.assetLoader = assetLoader;

    exports.Animation = bindConstructorToParameters(Animation, [stage]);
    exports.KeyframeAnimation = bindConstructorToParameters(KeyframeAnimation, [stage]);
    exports.Bitmap = bindConstructorToParameters(Bitmap, [assetLoader]);
    exports.FontFamily = bindConstructorToParameters(FontFamily, [assetLoader]);
    exports.Movie = bindConstructorToParameters(Movie, [stage]);
    exports.Sprite = bindConstructorToParameters(Sprite, [assetLoader]);
    exports.Video = bindConstructorToParameters(Video, [assetLoader]);
    exports.Audio = bindConstructorToParameters(Audio, [assetLoader]);

    exports.bonsai = exports;

    // Initialize environment data object
    exports.env = exports.environment = tools.mixin({
      windowHeight: 0,
      windowWidth: 0,
      windowScrollX: 0,
      windowScrollY: 0,
      offsetX: 0,
      offsetY: 0
    }, EventEmitter);
  }

  return Environment;
});
