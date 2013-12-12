/**
 * Font handler for AssetController
 * --
 * Fonts are loaded via AssetController.handlers.Raw (regular XHR)
 * And then applied in a <STYLE> added to <HEAD>
 */
define([
  './asset_handler',
  './raw_handler',
  '../tools'
],
function(AssetHandler, RawHandler, tools) {
  'use strict';

  var mimeToFormat = FontHandler.mimeToFormat = {
    // woff
    'woff': 'woff',
    'font/woff': 'woff',
    'application/x-woff': 'woff',
    'application/x-font-woff': 'woff',
    // opentype
    'otf': 'opentype',
    'font/otf': 'opentype',
    'font/opentype': 'opentype',
    'application/x-font-otf': 'opentype',
    'application/x-font-opentype': 'opentype',
    // truetype
    'ttf': 'truetype',
    'font/ttf': 'truetype',
    'font/truetype': 'truetype',
    'application/x-font-ttf': 'truetype',
    'application/x-font-truetype': 'truetype',
    // svg
    'svg': 'svg',
    'image/svg+xml': 'svg',
    // eot
    'application/vnd.ms-fontobject': 'eot'
  };

  var formatToMime = FontHandler.formatToMime = {
    eot: 'application/vnd.ms-fontobject',
    woff: 'application/x-font-woff',
    otf: 'font/opentype',
    svg: 'image/svg+xml',
    ttf: 'application/x-font-ttf'
  };

  var styleElement;

  FontHandler.fontIDs = {};
  // We prefix fonts with a unique string to avoid conflicts:
  FontHandler.prefix = 'bs_' + (new Date()).getTime() + '_';

  function FontHandler() {

    AssetHandler.apply(this, arguments);

    var fontId = this.request.id;

    this.fontFormats = [];
    this.fontId = FontHandler.fontIDs[fontId] = FontHandler.prefix + fontId;

    this.on('resourcesLoaded', function() {
      this.applyFontFace();
    });
  }

  FontHandler.prototype = Object.create(AssetHandler.prototype);

  FontHandler.prototype.loadResource = function(resource, doDone, doError) {

    var me = this,
        src = resource.src;

    if (/^data:/.test(src)) {
      doDone(src);
      return;
    }

    new RawHandler(src)
      .on('load', function(data) {
        var format;

        if (resource.type in mimeToFormat) {
          format = mimeToFormat[resource.type];
        } else {
          format = resource.type;
          console.warn('Resource type of ' + resource.type + ' might be not supported by the Font type handler');
        }

        var mime = resource.type in formatToMime ?
          formatToMime[resource.type] :
          resource.type in mimeToFormat ? // already a mime
            resource.type : '';

        // TODO: determine if we can rely on the src here, or if we have
        // to use a DATA URI?? : 'data:' + mime + ',' + encodeURIComponent(data),
        me.fontFormats.push({ uri: src, format: format });
        doDone();
      })
      .on('error', function() {
        doError('Cannot load font: ' + src);
      })
      .load();
  };

  FontHandler.prototype.applyFontFace = function(fontId, fontFormats) {

    // Using font-face declaration shown here (various hacks included):
    // http://nicewebtype.com/notes/2009/10/30/how-to-use-css-font-face/

    var fontId = this.fontId,
        fontFormats = this.fontFormats;

    if (!styleElement) {
      styleElement = (document.getElementsByTagName('head') || [document.body])[0]
        .appendChild(document.createElement('style'));
    }

    var format,
        uri,
        fontSrcs = [],
        eotFontSrc = '';

    tools.forEach(fontFormats, function(font) {

      uri = font.uri;
      format = font.format;

      if (format === 'eot') { // IE font
        eotFontSrc = 'url("' + uri + '") format("' + format + '")';
      } else {
        fontSrcs.push('url("' + uri + '") format("' + format + '")');
      }
    });

    styleElement.appendChild(document.createTextNode(
      '@font-face {' +
        'font-family: "' + fontId + '";\n' +
        (eotFontSrc ? 'src: ' + eotFontSrc + ';\n' : '') +
        (fontSrcs.length ? 'src: local("☺"), ' + fontSrcs.join(',\n') + ';\n' : '') +
      '}'
    ));
  };

  return FontHandler;
});
