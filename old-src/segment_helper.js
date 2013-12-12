define([
  './point',
  './error'
], function(Point, error) {
  'use strict';

  /**
   * This module contains utilities for working with and parsing segments.
   *
   * @private
   * @exports segment_helper
   * @requires module:point
   * @requires module:error
   */
  var segmentHelper;

  /**
   * The map of accepted commands.
   * Legend:
   *  P  => Point
   *  N => Number
   *  B => Boolean
   *
   * @type {object}
   * @memberof module:segment_helper
   */
  var commandMap = {
    'arcBy': {
      'attributes': ['P', 'N', 'B', 'B', 'P'],
      'shorthands': ['a']
    },
    'arcTo': {
      'attributes': ['P', 'N', 'B', 'B', 'P'],
      'shorthands': ['A']
    },
    'closePath': {
      'attributes': [],
      'shorthands': ['Z', 'z']
    },
    'curveBy': { // = bezierCurveBy
      'attributes': ['P', 'P', 'P'],
      'shorthands': ['c']
    },
    'curveTo': { // = bezierCurveTo
      'attributes': ['P', 'P', 'P'],
      'shorthands': ['C']
    },
    'horizontalLineTo': {
      'attributes': ['N'],
      'shorthands': ['H'],
      'convertTo' : 'lineTo'
    },
    'lineBy': {
      'attributes': ['P'],
      'shorthands': ['l']
    },
    'lineTo': {
      'attributes': ['P'],
      'shorthands': ['L']
    },
    'moveBy': {
      'attributes': ['P'],
      'shorthands': ['m']
    },
    'moveTo': {
      'attributes': ['P'],
      'shorthands': ['M']
    },
    'verticalLineBy': {
      'attributes': ['N'],
      'shorthands': ['v'],
      'convertTo' : 'lineBy'
    },
    'verticalLineTo': {
      'attributes': ['N'],
      'shorthands': ['V'],
      'convertTo' : 'lineTo'
    },
    'horizontalLineBy': {
      'attributes': ['N'],
      'shorthands': ['h'],
      'convertTo' : 'lineBy'
    },
    'quadraticCurveBy': { // quadraticBezierCurveBy
      'attributes': ['P', 'P'],
      'shorthands': ['q']
    },
    'quadraticCurveTo': { // quadraticBezierCurveTo
      'attributes': ['P', 'P'],
      'shorthands': ['Q']
    },
    'smoothCurveBy': { // = smoothbezierCurveBy
      'attributes': ['P', 'P'],
      'shorthands': ['s']
    },
    'smoothCurveTo': { // = smoothbezierCurveTo
      'attributes': ['P', 'P'],
      'shorthands': ['S']
    },
    'smoothQuadraticCurveBy': {
      'attributes': ['P'],
      'shorthands': ['t']
    },
    'smoothQuadraticCurveTo': {
      'attributes': ['P'],
      'shorthands': ['T']
    },
    'throughCurveBy': {
      'attributes': ['P', 'P'],
      'shorthands': ['tc']
    },
    'throughCurveTo': {
      'attributes': ['P', 'P'],
      'shorthands': ['TC']
    }
  };

  /**
   * A map between shorthands and commands.
   *
   * @type {Object}
   * @memberOf module:segment_helper
   */
  var shorthandCommandMap = {};
  for (var cmd in commandMap) {
    if (commandMap.hasOwnProperty(cmd)) {
      commandMap[cmd]['shorthands'].forEach(function(shorthand) {
        shorthandCommandMap[shorthand] = cmd;
      });
    }
  }

  /**
   * A map between commands and shorthands.
   *
   * @type {Object}
   * @memberOf module:segment_helper
   */
  var commandShorthandMap = {};
  for (var cmd in commandMap) {
    if (commandMap.hasOwnProperty(cmd)) {
      commandShorthandMap[cmd] = commandMap[cmd]['shorthands'][0];
    }
  }

  /**
   * A list of valid tokens.
   *
   * @type {array}
   * @memberOf module:segment_helper
   */
  var validTokens = [];
  for (var cmd in commandMap) {
    if (commandMap.hasOwnProperty(cmd)) {
      validTokens.push(cmd);
      validTokens = validTokens.concat(commandMap[cmd]['shorthands']);
    }
  }

  /**
   * Parses an array-like list of instructions and returns an Array of
   * ordered segments. Array-like means that the object needs to have a
   * length property and needs to be iterable (e.g. an Array, an arguments
   * object, a DOMStringList etc).
   *
   * @example parseCommandList(['lineTo', 5, 0], ['arcTo', 0, 0, 10, 20, 8]);
   *
   * @param {arraylike} list The array-like list of instructions.
   * @param {object} [cmdMap] An alternative commandMap used for parsing.
   * @returns {array} The segments.
   * @memberof module:segment_helper
   */
  function parseCommandList(list, cmdMap) {
    var attributeType,
        expectedAttributes,
        param,
        moveCommand,
        segment = [],
        startParsingNextSegment = true,
        parsedSegments = [],
        listLength = (list && list.length) || 0;

    cmdMap = cmdMap || commandMap;

    if (listLength === 0) {
      return [];
    }

    for (var instructions, command, item, i = 0; i < listLength; i++) {
      item = list[i];

      // introduces a new segment and expects a valid command.
      if (startParsingNextSegment) {
        startParsingNextSegment = false;
        segment = [];

        instructions = cmdMap[item];

        // http://www.w3.org/TR/SVG/paths.html#PathData
        // The command letter can be eliminated on subsequent commands if the same
        // command is used multiple times in a row (e.g., you can drop the second
        // "L" in "M 100 200 L 200 100 L -100 -200" and use "M 100 200 L 200 100 -100 -200" instead).
        if (typeof instructions === 'undefined') {
          if (typeof command === 'undefined') {
            throw new error.ParserError(['Unknown command: "' + item + '"']);
          }
          // if ´item´ is not a valid ´command´
          // we're expecting to continue with the old command and old instructions.
          instructions = cmdMap[command];
          i--;
        } else {
          // push command type
          command = item;
        }
        segment.push(command);
        // prepare attributes parsing
        expectedAttributes = instructions.attributes.slice(0);
      } else {
        // parse expected attributes
        attributeType = expectedAttributes.shift();
        param = +item;
        switch (attributeType) {
          case 'B':
          if (param != 0 && param != 1) {
            throw new error.ParserError(['Invalid parameter for command "' +
                command + '", expected 0 or 1 but got "' + item + '".']);
          }
          segment.push(param);
            break;
          case 'N':
            if (isNaN(param)) {
              throw new error.ParserError(['Invalid parameter for command "' +
                command + '", expected numeric but got "' + item + '".']);
            }
            segment.push(param);
            break;
          case 'P':
            // x value
            if (isNaN(param)) {
              throw new error.ParserError(['Could not create Point from String ' +
                'for command "' + command + '", expected numeric but got ' +
                '"' + item + '".']);
            }
            segment.push(param);

            // y value
            param = +list[++i];
            if (isNaN(param)) {
              throw new error.ParserError(['Could not create Point from String ' +
                'for command "' + command + '", expected numeric but got ' +
                '"' + list[i] + '".']);
            }
            segment.push(param);
            break;
        }
      }
      // no more expected attributes. go on parsing the next segment.
      if (expectedAttributes.length === 0) {
        startParsingNextSegment = true;
        parsedSegments.push(segment);
      }
    }
    return parsedSegments;
  }

  /**
   * Parses a string which represents a svg-path (list of instructions) and returns
   * an Array of ordered segments.
   *
   * @example parsePath('M0,0L50,0,l40,40');
   *
   * @param {string} path The list of instructions.
   * @returns {array} The segments.
   * @memberof module:segment_helper
   */
  function parsePath(path) {
    var pre = [];
    path.replace(/([a-z])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?\s*,?\s*)+)/ig, function(a,b,c) {
      pre.push(shorthandCommandMap[b]);
      c.replace(/(-?\d*\.?\d*(?:e[\-+]?\d+)?)\s*,?\s*/ig, function (a, b) {
        b && pre.push(b);
      });
    });
    return parseCommandList(pre);
  }

  /**
   * Parses an array of segments and returns a path that
   * represents a svg-path (list of instructions).
   *
   * @example exportToPath(['moveTo', 0, 0]);
   *
   * @param {Array} segments The segements array.
   * @param {boolean} [initialMove] Whether to prefix the path with M0 0
   * @returns {String} The path.
   * @memberof module:segment_helper
   */
   function exportToPath(segments, initialMove) {
    var command, item, path = [];
    for (var i = 0, iMax = segments.length; i < iMax; i++) {
      command = segments[i];
      for (var j = 0, jMax = command.length; j < jMax; j++) {
        item = command[j];
        path.push(typeof item == 'string' ? commandShorthandMap[item] : item);
      }
    }
    path = path.join(' ');

    return (initialMove && path.slice(0, 1) !== 'M') ? 'M 0 0 ' + path : path;
   }

  segmentHelper = {
    validTokens: validTokens,
    parsePath: parsePath,
    exportToPath: exportToPath,
    parseCommandList: parseCommandList
  };

  return segmentHelper;
});
