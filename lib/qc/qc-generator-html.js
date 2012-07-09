;(function(){
if (typeof exports!='undefined') {  var __qc = require('./qc.js').qc;} else {  var __qc = qc;};var __generator_html__util=( function(qc) {
  var exports = {};
  exports.getHexNumber = function(length) {
    var vals = [];
    for (var i=0; i<Math.ceil(length/2); i++){ vals.push(qc.getPositiveInteger(255)); };
    var digits = vals.map(function(val){ return ('0' + val.toString(16)).slice(-2); }).join('');
    return digits.slice(0, length);
  };
  var colorNames = [
    'none',
    'Aqua', 'Aquamarine',
    'Blue', 'BlueViolet',
    'CadetBlue', 'Chartreuse', 'Coral', 'CornflowerBlue', 'Crimson', 'Cyan',
    'DarkBlue', 'DarkCyan', 'DarkGreen', 'DarkKhaki', 'DarkMagenta',
    'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon',
    'DarkSeaGreen', 'DarkSlateBlue', 'DarkTurquoise', 'DarkViolet',
    'DeepPink', 'DeepSkyBlue', 'DodgerBlue',
    'FireBrick', 'ForestGreen', 'Fuchsia',
    'Gold', 'Green', 'GreenYellow',
    'HotPink',
    'IndianRed',
    'Indigo',
    'Khaki',
    'Lavender', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan',
    'LightGoldenrodYellow', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSalmon',
    'LightSeaGreen', 'LightSkyBlue', 'LightSteelBlue', 'LightYellow', 'Lime',
    'LimeGreen',
    'Magenta', 'MediumAquamarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple',
    'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise',
    'MediumVioletRed', 'MidnightBlue', 'Moccasin',
    'Navy',
    'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid',
    'PaleGoldenrod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip',
    'PeachPuff', 'Pink', 'Plum', 'PowderBlue', 'Purple',
    'Red', 'RoyalBlue',
    'Salmon', 'SeaGreen', 'SkyBlue', 'SlateBlue', 'SpringGreen', 'SteelBlue',
    'Teal', 'Thistle', 'Tomato', 'Turquoise',
    'Violet',
    'Yellow', 'YellowGreen'
  ];
  exports.getRandomColorName = function() {
    var len = colorNames.length;
    var index = Math.round(Math.random() * (len-1));
    return colorNames[index];
  };
  return exports;
})(__qc);

;var __generator_html_color=( function(qc, util) {
  var gen = qc.generator;
  var exports = {};
  exports.any = function() {
    return {
      func: function() {
        return qc.generateValue(gen.chooseGenerator(
          exports.hexColors(3),
          exports.hexColors(6),
          exports.names(),
          exports.nameUpperCases(),
          exports.nameLowerCases(),
          exports.nameRandomCases(),
          exports.rgb(),
          exports.rgbaPercent(),
          exports.rgba(),
          exports.rgbaPercent()
        ));
      }
    };
  };
  exports.hexUpperCases = function(size) {
    return {
      func: function() {
        return '#' + util.getHexNumber(size).toUpperCase();
      }
    };
  };
  exports.hexLowerCases = function(size) {
    return {
      func: function() {
        return '#' + util.getHexNumber(size).toLowerCase();
      }
    };
  };
  exports.hexMixedCases = function(size) {
    return {
      func: function() {
        var ret = util.getHexNumber(size);
                ret = ret.split('').map(function(char) {
                    var func = Math.round(Math.random()) ? 'toLowerCase' : 'toUpperCase';
          return char[func]();
        });
        return '#' + ret.join('');
      }
    };
  };
  exports.hexColors = function(size) {
    return {
      func: function() {
        return qc.generateValue(
          gen.chooseGenerator(
            exports.hexLowerCases(size),
            exports.hexUpperCases(size),
            exports.hexMixedCases(size)
          )
        );
      }
    };
  };
  exports.names = function() {
    return {
      func: function() {
        return util.getRandomColorName();
      }
    };
  };
  exports.nameUpperCases = function() {
    return {
      func: function() {
        return util.getRandomColorName().toUpperCase();
      }
    };
  };
  exports.nameLowerCases = function() {
    return {
      func: function() {
        return util.getRandomColorName().toLowerCase();
      }
    };
  };
  exports.nameRandomCases = function() {
    return {
      func: function() {
        return util.getRandomColorName()
          .split('')
          .map(function(s){return s['to'+(Math.random()>0.5?'Upper':'Lower')+'Case']();})
          .join('');
      }
    };
  };
  exports.rgb = function() {
    return {
      func: function() {
        var vals = [qc.getPositiveInteger(255), qc.getPositiveInteger(255), qc.getPositiveInteger(255)];
        return 'rgb(' + vals.join(',') + ')';
      }
    };
  };
  exports.rgbPercent = function() {
    return {
      func: function() {
        var vals = [qc.getPositiveInteger(100), qc.getPositiveInteger(100), qc.getPositiveInteger(100)];
        return 'rgb(' + vals.join('%,') + '%)';
      }
    };
  };
  exports.rgba = function() {
    return {
      func: function() {
        var vals = [qc.getPositiveInteger(255), qc.getPositiveInteger(255), qc.getPositiveInteger(255), qc.getPositiveFloat(1)];
        return 'rgba(' + vals.join(',') + ')';
      }
    };
  };
  exports.rgbaPercent = function() {
    return {
      func: function() {
        var vals = [qc.getPositiveInteger(100), qc.getPositiveInteger(100), qc.getPositiveInteger(100), qc.getPositiveFloat(1)];
        return 'rgba(' + vals.join('%,') + ')';
      }
    };
  };
  return exports;
})(__qc,__generator_html__util);

;var __generator_html___all__=( function(color) {
      var exports = {
    color: color
  };
  return exports;
})(__generator_html_color);


if (typeof exports=='undefined') {qc.generator.html = __generator_html___all__;} else {  exports.qc_generator_html = __generator_html___all__;}})();