(function() {
  var module$bootstrapper$context$script_loader = {module$exports:function(a) {
    return{isLoading:!1, isWaiting:0, waitingCallbacks:[], queue:[], load:function(b, c) {
      var d = this, e = this.queue, f = this.waitingCallbacks;
      this.isLoading || this.isWaiting ? e.push([b, c]) : (this.isLoading = !0, a(b, function(a) {
        a ? c(a) : (c && (d.isWaiting ? f.push(c) : c(null)), d.isLoading = !1, e.length && d.load.apply(d, e.shift()))
      }))
    }, wait:function() {
      this.isWaiting++
    }, done:function() {
      this.isWaiting--;
      if(!this.isWaiting) {
        for(var a = 0, c = this.waitingCallbacks.length;a < c;++a) {
          this.waitingCallbacks[a](null)
        }
      }
      this.queue.length && this.load.apply(this, this.queue.shift())
    }}
  }};
  module$bootstrapper$context$script_loader.module$exports && (module$bootstrapper$context$script_loader = module$bootstrapper$context$script_loader.module$exports);
  var module$color_map = {}, colorMap$$module$color_map = {aliceblue:4042850303, antiquewhite:4209760255, aqua:16777215, aquamarine:2147472639, azure:4043309055, beige:4126530815, bisque:4293182719, black:255, blanchedalmond:4293643775, blue:65535, blueviolet:2318131967, brown:2771004159, burlywood:3736635391, cadetblue:1604231423, chartreuse:2147418367, chocolate:3530104575, coral:4286533887, cornflowerblue:1687547391, cornsilk:4294499583, crimson:3692313855, cyan:16777215, darkblue:35839, darkcyan:9145343, 
  darkgoldenrod:3095792639, darkgray:2846468607, darkgreen:6553855, darkgrey:2846468607, darkkhaki:3182914559, darkmagenta:2332068863, darkolivegreen:1433087999, darkorange:4287365375, darkorchid:2570243327, darkred:2332033279, darksalmon:3918953215, darkseagreen:2411499519, darkslateblue:1211993087, darkslategray:793726975, darkslategrey:793726975, darkturquoise:13554175, darkviolet:2483082239, deeppink:4279538687, deepskyblue:12582911, dimgray:1768516095, dimgrey:1768516095, dodgerblue:512819199, 
  firebrick:2988581631, floralwhite:4294635775, forestgreen:579543807, fuchsia:4278255615, gainsboro:3705462015, ghostwhite:4177068031, gold:4292280575, goldenrod:3668254975, gray:2155905279, green:8388863, greenyellow:2919182335, grey:2155905279, honeydew:4043305215, hotpink:4285117695, indianred:3445382399, indigo:1258324735, ivory:4294963455, khaki:4041641215, lavender:3873897215, lavenderblush:4293981695, lawngreen:2096890111, lemonchiffon:4294626815, lightblue:2916673279, lightcoral:4034953471, 
  lightcyan:3774873599, lightgoldenrodyellow:4210742015, lightgray:3553874943, lightgreen:2431553791, lightgrey:3553874943, lightpink:4290167295, lightsalmon:4288707327, lightseagreen:548580095, lightskyblue:2278488831, lightslategray:2005441023, lightslategrey:2005441023, lightsteelblue:2965692159, lightyellow:4294959359, lime:16711935, limegreen:852308735, linen:4210091775, magenta:4278255615, maroon:2147483903, mediumaquamarine:1724754687, mediumblue:52735, mediumorchid:3126187007, mediumpurple:2473647103, 
  mediumseagreen:1018393087, mediumslateblue:2070474495, mediumspringgreen:16423679, mediumturquoise:1221709055, mediumvioletred:3340076543, midnightblue:421097727, mintcream:4127193855, mistyrose:4293190143, moccasin:4293178879, navajowhite:4292783615, navy:33023, oldlace:4260751103, olive:2155872511, olivedrab:1804477439, orange:4289003775, orangered:4282712319, orchid:3664828159, palegoldenrod:4008225535, palegreen:2566625535, paleturquoise:2951671551, palevioletred:3681588223, papayawhip:4293907967, 
  peachpuff:4292524543, peru:3448061951, pink:4290825215, plum:3718307327, powderblue:2967529215, purple:2147516671, red:4278190335, rosybrown:3163525119, royalblue:1097458175, saddlebrown:2336560127, salmon:4202722047, sandybrown:4104413439, seagreen:780883967, seashell:4294307583, sienna:2689740287, silver:3233857791, skyblue:2278484991, slateblue:1784335871, slategray:1887473919, slategrey:1887473919, snow:4294638335, springgreen:16744447, steelblue:1182971135, tan:3535047935, teal:8421631, thistle:3636451583, 
  tomato:4284696575, transparent:0, turquoise:1088475391, violet:4001558271, wheat:4125012991, white:4294967295, whitesmoke:4126537215, yellow:4294902015, yellowgreen:2597139199};
  Object.defineProperty(colorMap$$module$color_map, "random", {get:function() {
    return 16777215 * Math.random() << 8 | 255
  }});
  module$color_map.module$exports = colorMap$$module$color_map;
  module$color_map.module$exports && (module$color_map = module$color_map.module$exports);
  var module$error = {};
  function ParserError$$module$error(a) {
    if(!(this instanceof ParserError$$module$error)) {
      return new ParserError$$module$error(a)
    }
    this.name = "ParserError";
    this.message = a[0]
  }
  ParserError$$module$error.prototype = Error();
  ParserError$$module$error.prototype.constructor = ParserError$$module$error;
  var error$$module$error = {ParserError:ParserError$$module$error};
  module$error.module$exports = error$$module$error;
  module$error.module$exports && (module$error = module$error.module$exports);
  var module$point = {}, sqrt$$module$point = Math.sqrt;
  function Point$$module$point(a, b) {
    this.x = a || 0;
    this.y = b || 0
  }
  var proto$$module$point = Point$$module$point.prototype;
  proto$$module$point.add = function(a) {
    this.x += a.x;
    this.y += a.y;
    return this
  };
  proto$$module$point.equals = function(a) {
    return this.x == a.x && this.y == a.y
  };
  proto$$module$point.clone = function() {
    return new Point$$module$point(this.x, this.y)
  };
  proto$$module$point.normalize = function(a) {
    sqrt$$module$point(this.x * this.x + this.y * this.y);
    a /= this.length;
    this.x *= a;
    this.y *= a;
    return this
  };
  proto$$module$point.offset = function(a, b) {
    this.x += a;
    this.y += b;
    return this
  };
  proto$$module$point.subtract = function(a) {
    this.x -= a.x;
    this.y -= a.y;
    return this
  };
  proto$$module$point.divide = function(a) {
    this.x /= a;
    this.y /= a;
    return this
  };
  proto$$module$point.multiply = function(a) {
    this.x *= a;
    this.y *= a;
    return this
  };
  proto$$module$point.toString = function() {
    return this.x + "," + this.y + " "
  };
  proto$$module$point.toObject = function() {
    return Object.create(null, {x:{value:this.x}, y:{value:this.y}})
  };
  proto$$module$point.toArray = function() {
    return[this.x, this.y]
  };
  proto$$module$point.distance = function(a) {
    var b = this.x - a.x, a = this.y - a.y;
    return sqrt$$module$point(b * b + a * a)
  };
  Point$$module$point.interpolate = function(a, b, c) {
    return new Point$$module$point(a.x + c * (a.x - b.x), a.y + c * (a.y - b.y))
  };
  Point$$module$point.polar = function(a, b) {
    return new Point$$module$point(a * Math.cos(b), a * Math.sin(b))
  };
  Point$$module$point.lerp = function(a, b, c) {
    return a.clone().multiply(1 - c).add(b.clone().multiply(c))
  };
  module$point.module$exports = Point$$module$point;
  module$point.module$exports && (module$point = module$point.module$exports);
  var module$renderer$svg$svg_helper = {}, hasOwn$$module$renderer$svg$svg_helper = {}.hasOwnProperty, helpers$$module$renderer$svg$svg_helper = {filterToSignature:function(a) {
    return a.type + "(" + a.value + ")"
  }, gradientToSignature:function(a) {
    switch(a.type) {
      case "linear-gradient":
        return"linear-gradient" + [a.direction, a.stops, helpers$$module$renderer$svg$svg_helper.matrixToString(a.matrix), a.spreadMethod].join(":");
      case "radial-gradient":
        return"radial-gradient" + [a.cx, a.cy, a.radius, a.stops, helpers$$module$renderer$svg$svg_helper.matrixToString(a.matrix), a.spreadMethod].join(":")
    }
  }, valueFromSignatureForType:function(a, b) {
    var c = RegExp(b + "\\((.+)\\)").exec(a);
    return c && c[1]
  }, matrixToString:function(a) {
    return a ? "matrix(" + [a.a, a.b, a.c, a.d, a.tx, a.ty].join() + ")" : ""
  }, cssClasses:function() {
    if("undefined" != typeof document) {
      var a = {nonSelectable:"-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-moz-user-select: -moz-none;-ms-user-select: none;-o-user-select: none;user-select: none;", selectable:"-webkit-touch-callout: default;-webkit-user-select: text;-khtml-user-select: text;-moz-user-select: text;-ms-user-select: text;-o-user-select: text;user-select: text;"}, b = {}, c = 0, d = (document.getElementsByTagName("head") || [document.body])[0].appendChild(document.createElement("style")), 
      e = [], f;
      for(f in a) {
        b[f] = "bs-" + +new Date + "-" + ++c, hasOwn$$module$renderer$svg$svg_helper.call(a, f) && e.push("." + b[f] + "{" + a[f] + "}\n")
      }
      d.appendChild(document.createTextNode(e.join("")));
      return{add:function(a, c) {
        a.setAttribute("class", (a.getAttribute("class") || "") + " " + b[c])
      }, remove:function(a, c) {
        a.setAttribute("class", (a.getAttribute("class") || "").replace(b[c], ""))
      }}
    }
  }()};
  module$renderer$svg$svg_helper.module$exports = helpers$$module$renderer$svg$svg_helper;
  module$renderer$svg$svg_helper.module$exports && (module$renderer$svg$svg_helper = module$renderer$svg$svg_helper.module$exports);
  var module$runner$animation$corner_radius_translations = {module$exports:{cornerRadius:{setup:function(a) {
    var b = a.cornerRadius, b = b || 0;
    a.cornerRadius0 = b[0] || b;
    a.cornerRadius1 = b[1] || b;
    a.cornerRadius2 = b[2] || b;
    a.cornerRadius3 = b[3] || b
  }, step:function(a) {
    a.cornerRadius = [a.cornerRadius0, a.cornerRadius1, a.cornerRadius2, a.cornerRadius3];
    delete a.cornerRadius0;
    delete a.cornerRadius1;
    delete a.cornerRadius2;
    delete a.cornerRadius3
  }}}};
  module$runner$animation$corner_radius_translations.module$exports && (module$runner$animation$corner_radius_translations = module$runner$animation$corner_radius_translations.module$exports);
  var module$runner$animation$easing = {}, easingFuncs$$module$runner$animation$easing = {linear:function(a) {
    return a
  }, quadIn:function(a) {
    return Math.pow(a, 2)
  }, quadOut:function(a) {
    return-1 * a * (a - 2)
  }, quadInOut:function(a) {
    a *= 2;
    return 1 > a ? Math.pow(a, 2) / 2 : -1 * (--a * (a - 2) - 1) / 2
  }, cubicIn:function(a) {
    return Math.pow(a, 3)
  }, cubicOut:function(a) {
    return Math.pow(a - 1, 3) + 1
  }, cubicInOut:function(a) {
    a *= 2;
    return 1 > a ? Math.pow(a, 3) / 2 : (Math.pow(a - 2, 3) + 2) / 2
  }, quartIn:function(a) {
    return Math.pow(a, 4)
  }, quartOut:function(a) {
    return-1 * (Math.pow(a - 1, 4) - 1)
  }, quartInOut:function(a) {
    a *= 2;
    return 1 > a ? Math.pow(a, 4) / 2 : -0.5 * (Math.pow(a - 2, 4) - 2)
  }, quintIn:function(a) {
    return Math.pow(a, 5)
  }, quintOut:function(a) {
    return Math.pow(a - 1, 5) + 1
  }, quintInOut:function(a) {
    a *= 2;
    return 1 > a ? Math.pow(a, 5) / 2 : (Math.pow(a - 2, 5) + 2) / 2
  }, sineIn:function(a) {
    return-1 * Math.cos(a * (Math.PI / 2)) + 1
  }, sineOut:function(a) {
    return Math.sin(a * (Math.PI / 2))
  }, sineInOut:function(a) {
    return-1 * (Math.cos(Math.PI * a) - 1) / 2
  }, expoIn:function(a) {
    return 0 === a ? 0 : Math.pow(2, 10 * (a - 1))
  }, expoOut:function(a) {
    return 1 === a ? 1 : -1 * Math.pow(2, -10 * a) + 1
  }, expoInOut:function(a) {
    if(0 === a) {
      return 0
    }
    if(1 === a) {
      return 1
    }
    a *= 2;
    if(1 > a) {
      return Math.pow(2, 10 * (a - 1)) / 2
    }
    --a;
    return(-1 * Math.pow(2, -10 * a) + 2) / 2
  }, circIn:function(a) {
    return-1 * (Math.sqrt(1 - Math.pow(a, 2)) - 1)
  }, circOut:function(a) {
    return Math.sqrt(1 - Math.pow(a - 1, 2))
  }, circInOut:function(a) {
    a *= 2;
    return 1 > a ? -0.5 * (Math.sqrt(1 - Math.pow(a, 2)) - 1) : 0.5 * (Math.sqrt(1 - Math.pow(a - 2, 2)) + 1)
  }, backIn:function(a) {
    return Math.pow(a, 2) * (2.70158 * a - 1.70158)
  }, backOut:function(a) {
    a -= 1;
    return Math.pow(a, 2) * (2.70158 * a + 1.70158) + 1
  }, backInOut:function(a) {
    a *= 2;
    if(1 > a) {
      return Math.pow(a, 2) * (3.5949095 * a - 2.5949095) / 2
    }
    a -= 2;
    return(Math.pow(a, 2) * (3.5949095 * a + 2.5949095) + 2) / 2
  }, elasticIn:function(a) {
    if(0 === a || 1 === a) {
      return a
    }
    a -= 1;
    return-1 * Math.pow(2, 10 * a) * Math.sin((a - 0.075) * 2 * Math.PI / 0.3)
  }, elasticOut:function(a) {
    return 0 === a || 1 === a ? a : Math.pow(2, -10 * a) * Math.sin((a - 0.075) * 2 * Math.PI / 0.3) + 1
  }, elasticInOut:function(a) {
    if(0 === a) {
      return 0
    }
    a *= 2;
    if(2 === a) {
      return 1
    }
    var b = 0.3 * 1.5, c = b / 4;
    if(1 > a) {
      return a -= 1, -0.5 * Math.pow(2, 10 * a) * Math.sin((a - c) * 2 * Math.PI / b)
    }
    a -= 1;
    return 0.5 * Math.pow(2, -10 * a) * Math.sin((a - c) * 2 * Math.PI / b) + 1
  }, bounceIn:function(a) {
    return 1 - easingFuncs$$module$runner$animation$easing.bounceOut(1 - a)
  }, bounceOut:function(a) {
    return a = a < 1 / 2.75 ? 7.5625 * Math.pow(a, 2) : a < 2 / 2.75 ? 7.5625 * Math.pow(a - 1.5 / 2.75, 2) + 0.75 : a < 2.5 / 2.75 ? 7.5625 * Math.pow(a - 2.25 / 2.75, 2) + 0.9375 : 7.5625 * Math.pow(a - 2.625 / 2.75, 2) + 0.984375
  }, bounceInOut:function(a) {
    return 0.5 > a ? easingFuncs$$module$runner$animation$easing.bounceIn(2 * a) / 2 : easingFuncs$$module$runner$animation$easing.bounceOut(2 * a - 1) / 2 + 0.5
  }};
  module$runner$animation$easing.module$exports = easingFuncs$$module$runner$animation$easing;
  module$runner$animation$easing.module$exports && (module$runner$animation$easing = module$runner$animation$easing.module$exports);
  var module$runner$filter$base_filter = {}, filter$$module$runner$filter$base_filter = {BaseFilter:function(a, b, c) {
    this.type = a;
    this.value = "undefined" == typeof b ? c : b
  }, createFactory:function(a, b) {
    filter$$module$runner$filter$base_filter[a] = function() {
      var a = Object.create(b.prototype), d = b.apply(a, arguments);
      return"object" === typeof d ? d : a
    }
  }};
  module$runner$filter$base_filter.module$exports = filter$$module$runner$filter$base_filter;
  module$runner$filter$base_filter.module$exports && (module$runner$filter$base_filter = module$runner$filter$base_filter.module$exports);
  var module$runner$matrix = {}, Point$$module$runner$matrix = module$point, cos$$module$runner$matrix = Math.cos, sin$$module$runner$matrix = Math.sin;
  function Matrix$$module$runner$matrix(a, b, c, d, e, f) {
    this.a = null != a ? a : 1;
    this.b = b || 0;
    this.c = c || 0;
    this.d = null != d ? d : 1;
    this.tx = e || 0;
    this.ty = f || 0
  }
  Matrix$$module$runner$matrix.prototype = {clone:function() {
    return new Matrix$$module$runner$matrix(this.a, this.b, this.c, this.d, this.tx, this.ty)
  }, concat:function(a) {
    var b = this.a, c = this.b, d = this.c, e = this.d, f = this.tx, g = this.ty;
    this.a = b * a.a + c * a.c;
    this.b = b * a.b + c * a.d;
    this.c = d * a.a + e * a.c;
    this.d = d * a.b + e * a.d;
    this.tx = f * a.a + g * a.c + a.tx;
    this.ty = f * a.b + g * a.d + a.ty;
    return this
  }, createBox:function(a, b, c, d, e) {
    return this.identify().rotate(c).scale(a, b).translate(d, e)
  }, deltaTransformPoint:function(a) {
    return new Point$$module$runner$matrix(this.a * a.x + this.c * a.y, this.b * a.x + this.d * a.y)
  }, identify:function() {
    this.a = this.d = 1;
    this.b = this.c = this.tx = this.ty = 0;
    return this
  }, invert:function() {
    var a = this.a * this.d - this.b * this.c, b = this.a, c = this.b, d = this.c, e = this.d, f = this.tx, g = this.ty;
    this.a = e / a;
    this.b = -c / a;
    this.c = -d / a;
    this.d = b / a;
    this.tx = (d * g - e * f) / a;
    this.ty = (c * f - b * g) / a;
    return this
  }, rotate:function(a) {
    var b = cos$$module$runner$matrix(a), a = sin$$module$runner$matrix(a);
    return this.concat(new Matrix$$module$runner$matrix(b, a, -a, b, 0, 0))
  }, scale:function(a, b) {
    this.a *= a;
    this.b *= b;
    this.c *= a;
    this.d *= b;
    this.tx *= a;
    this.ty *= b;
    return this
  }, transformPoint:function(a) {
    return new Point$$module$runner$matrix(this.a * a.x + this.c * a.y + this.tx, this.b * a.x + this.d * a.y + this.ty)
  }, translate:function(a, b) {
    this.tx += a;
    this.ty += b;
    return this
  }};
  module$runner$matrix.module$exports = Matrix$$module$runner$matrix;
  module$runner$matrix.module$exports && (module$runner$matrix = module$runner$matrix.module$exports);
  var module$runner$animation$matrix_translations = {}, Matrix$$module$runner$animation$matrix_translations = module$runner$matrix;
  module$runner$animation$matrix_translations.module$exports = {matrix:{setupTo:function(a) {
    var b = a.matrix;
    a.matrix_a = b.a;
    a.matrix_b = b.b;
    a.matrix_c = b.c;
    a.matrix_d = b.d;
    a.matrix_tx = b.tx;
    a.matrix_ty = b.ty;
    this.animatedMatrix = new Matrix$$module$runner$animation$matrix_translations
  }, setupFrom:function(a) {
    var b = a.matrix;
    a.matrix_a = b.a;
    a.matrix_b = b.b;
    a.matrix_c = b.c;
    a.matrix_d = b.d;
    a.matrix_tx = b.tx;
    a.matrix_ty = b.ty;
    delete a.matrix
  }, step:function(a) {
    a.matrix = this.animatedMatrix;
    a.matrix.a = a.matrix_a;
    a.matrix.b = a.matrix_b;
    a.matrix.c = a.matrix_c;
    a.matrix.d = a.matrix_d;
    a.matrix.tx = a.matrix_tx;
    a.matrix.ty = a.matrix_ty;
    delete a.matrix_a;
    delete a.matrix_b;
    delete a.matrix_c;
    delete a.matrix_d;
    delete a.matrix_tx;
    delete a.matrix_ty
  }}};
  module$runner$animation$matrix_translations.module$exports && (module$runner$animation$matrix_translations = module$runner$animation$matrix_translations.module$exports);
  var module$runner$registry = {};
  function MovieRegistry$$module$runner$registry() {
    var a = this.movies = [];
    this.add = function(b) {
      -1 === a.indexOf(b) && a.push(b)
    };
    this.remove = function(b) {
      b = a.indexOf(b);
      delete a[b]
    }
  }
  function Registry$$module$runner$registry() {
    return{displayObjects:Object.create(null), loadingDisplayObjects:Object.create(null), movies:new MovieRegistry$$module$runner$registry, needsDraw:Object.create(null), needsInsertion:Object.create(null), pendingAssets:Object.create(null)}
  }
  module$runner$registry.module$exports = Registry$$module$runner$registry;
  module$runner$registry.module$exports && (module$runner$registry = module$runner$registry.module$exports);
  var module$runner$ui_event = {}, bubbleEvents$$module$runner$ui_event = {mouseover:!0, mouseout:!0, mousewheel:!0, pointerup:!0, pointerdown:!0, pointermove:!0, click:!0, doubleclick:!0, "multi:pointerdown":!0, "multi:pointermove":!0, "multi:pointerup":!0};
  function emitOn$$module$runner$ui_event(a) {
    var b = this.type, c = bubbleEvents$$module$runner$ui_event[b];
    do {
      a.emit(b, this), a = a.parent
    }while(c && !this._isStopped && a)
  }
  function stopEvent$$module$runner$ui_event() {
    this._isStopped = !0
  }
  function uiEvent$$module$runner$ui_event(a) {
    a.emitOn = emitOn$$module$runner$ui_event;
    a.stop = stopEvent$$module$runner$ui_event;
    return a
  }
  module$runner$ui_event.module$exports = uiEvent$$module$runner$ui_event;
  module$runner$ui_event.module$exports && (module$runner$ui_event = module$runner$ui_event.module$exports);
  var module$segment_helper = {}, Point$$module$segment_helper = module$point, error$$module$segment_helper = module$error, segmentHelper$$module$segment_helper, commandMap$$module$segment_helper = {arcBy:{attributes:["P", "N", "B", "B", "P"], shorthands:["a"]}, arcTo:{attributes:["P", "N", "B", "B", "P"], shorthands:["A"]}, closePath:{attributes:[], shorthands:["Z", "z"]}, curveBy:{attributes:["P", "P", "P"], shorthands:["c"]}, curveTo:{attributes:["P", "P", "P"], shorthands:["C"]}, horizontalLineTo:{attributes:["N"], 
  shorthands:["H"], convertTo:"lineTo"}, lineBy:{attributes:["P"], shorthands:["l"]}, lineTo:{attributes:["P"], shorthands:["L"]}, moveBy:{attributes:["P"], shorthands:["m"]}, moveTo:{attributes:["P"], shorthands:["M"]}, verticalLineBy:{attributes:["N"], shorthands:["v"], convertTo:"lineBy"}, verticalLineTo:{attributes:["N"], shorthands:["V"], convertTo:"lineTo"}, horizontalLineBy:{attributes:["N"], shorthands:["h"], convertTo:"lineBy"}, quadraticCurveBy:{attributes:["P", "P"], shorthands:["q"]}, 
  quadraticCurveTo:{attributes:["P", "P"], shorthands:["Q"]}, smoothCurveBy:{attributes:["P", "P"], shorthands:["s"]}, smoothCurveTo:{attributes:["P", "P"], shorthands:["S"]}, smoothQuadraticCurveBy:{attributes:["P"], shorthands:["t"]}, smoothQuadraticCurveTo:{attributes:["P"], shorthands:["T"]}, throughCurveBy:{attributes:["P", "P"], shorthands:["tc"]}, throughCurveTo:{attributes:["P", "P"], shorthands:["TC"]}}, shorthandCommandMap$$module$segment_helper = {}, cmd$$module$segment_helper;
  for(cmd$$module$segment_helper in commandMap$$module$segment_helper) {
    commandMap$$module$segment_helper.hasOwnProperty(cmd$$module$segment_helper) && commandMap$$module$segment_helper[cmd$$module$segment_helper].shorthands.forEach(function(a) {
      shorthandCommandMap$$module$segment_helper[a] = cmd$$module$segment_helper
    })
  }
  var commandShorthandMap$$module$segment_helper = {};
  for(cmd$$module$segment_helper in commandMap$$module$segment_helper) {
    commandMap$$module$segment_helper.hasOwnProperty(cmd$$module$segment_helper) && (commandShorthandMap$$module$segment_helper[cmd$$module$segment_helper] = commandMap$$module$segment_helper[cmd$$module$segment_helper].shorthands[0])
  }
  var validTokens$$module$segment_helper = [];
  for(cmd$$module$segment_helper in commandMap$$module$segment_helper) {
    commandMap$$module$segment_helper.hasOwnProperty(cmd$$module$segment_helper) && (validTokens$$module$segment_helper.push(cmd$$module$segment_helper), validTokens$$module$segment_helper = validTokens$$module$segment_helper.concat(commandMap$$module$segment_helper[cmd$$module$segment_helper].shorthands))
  }
  function parseCommandList$$module$segment_helper(a, b) {
    var c, d, e, f = [], g = !0, h = [], j = a && a.length || 0, b = b || commandMap$$module$segment_helper;
    if(0 === j) {
      return[]
    }
    for(var i, k, l = 0;l < j;l++) {
      k = a[l];
      if(g) {
        g = !1;
        f = [];
        c = b[k];
        if("undefined" === typeof c) {
          if("undefined" === typeof i) {
            throw new error$$module$segment_helper.ParserError(['Unknown command: "' + k + '"']);
          }
          c = b[i];
          l--
        }else {
          i = k
        }
        f.push(i);
        d = c.attributes.slice(0)
      }else {
        switch(c = d.shift(), e = +k, c) {
          case "B":
            if(0 != e && 1 != e) {
              throw new error$$module$segment_helper.ParserError(['Invalid parameter for command "' + i + '", expected 0 or 1 but got "' + k + '".']);
            }
            f.push(e);
            break;
          case "N":
            if(isNaN(e)) {
              throw new error$$module$segment_helper.ParserError(['Invalid parameter for command "' + i + '", expected numeric but got "' + k + '".']);
            }
            f.push(e);
            break;
          case "P":
            if(isNaN(e)) {
              throw new error$$module$segment_helper.ParserError(['Could not create Point from String for command "' + i + '", expected numeric but got "' + k + '".']);
            }
            f.push(e);
            e = +a[++l];
            if(isNaN(e)) {
              throw new error$$module$segment_helper.ParserError(['Could not create Point from String for command "' + i + '", expected numeric but got "' + a[l] + '".']);
            }
            f.push(e)
        }
      }
      0 === d.length && (g = !0, h.push(f))
    }
    return h
  }
  function parsePath$$module$segment_helper(a) {
    var b = [];
    a.replace(/([a-z])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?\s*,?\s*)+)/ig, function(a, d, e) {
      b.push(shorthandCommandMap$$module$segment_helper[d]);
      e.replace(/(-?\d*\.?\d*(?:e[\-+]?\d+)?)\s*,?\s*/ig, function(a, c) {
        c && b.push(c)
      })
    });
    return parseCommandList$$module$segment_helper(b)
  }
  function exportToPath$$module$segment_helper(a, b) {
    for(var c, d, e = [], f = 0, g = a.length;f < g;f++) {
      c = a[f];
      for(var h = 0, j = c.length;h < j;h++) {
        d = c[h], e.push("string" == typeof d ? commandShorthandMap$$module$segment_helper[d] : d)
      }
    }
    e = e.join(" ");
    return b && "M" !== e.slice(0, 1) ? "M 0 0 " + e : e
  }
  segmentHelper$$module$segment_helper = {validTokens:validTokens$$module$segment_helper, parsePath:parsePath$$module$segment_helper, exportToPath:exportToPath$$module$segment_helper, parseCommandList:parseCommandList$$module$segment_helper};
  module$segment_helper.module$exports = segmentHelper$$module$segment_helper;
  module$segment_helper.module$exports && (module$segment_helper = module$segment_helper.module$exports);
  var module$tools = {}, hasOwnProperty$$module$tools = {}.hasOwnProperty, indexOf$$module$tools = [].indexOf, noop$$module$tools = function() {
  }, push$$module$tools = [].push, slice$$module$tools = [].slice, toString$$module$tools = {}.toString, tools$$module$tools = {baseUri:function(a) {
    var b = a.baseURI;
    if(void 0 !== b) {
      return b.replace(/[/]+[^/]*$/, "/")
    }
    a = a.createElement("a");
    a.href = ".";
    return a.href
  }, beget:function(a) {
    noop$$module$tools.prototype = a;
    return new noop$$module$tools
  }, descriptorAccessor:function(a, b, c, d) {
    return{get:a, set:b, enumerable:!!c, configurable:!!d}
  }, descriptorData:function(a, b, c, d) {
    return{value:a, writable:!!b, enumerable:!!c, configurable:!!d}
  }, forEach:function(a, b, c) {
    var d = a.length;
    c && (b = tools$$module$tools.hitch(c, b));
    for(c = 0;c < d && !1 !== b(a[c], c, a);c += 1) {
    }
    return a
  }, forOwn:function(a, b, c) {
    c && (b = tools$$module$tools.hitch(c, b));
    for(var d in a) {
      if(hasOwnProperty$$module$tools.call(a, d) && !1 === b(a[d], d, a)) {
        break
      }
    }
    return a
  }, getter:function(a) {
    return function() {
      return this[a]
    }
  }, hitch:function(a, b, c) {
    if(2 < arguments.length) {
      var c = slice$$module$tools.call(arguments, 2), d = c.length
    }
    "string" == typeof b && (b = a[b]);
    return c ? function() {
      c.length = d;
      push$$module$tools.apply(c, arguments);
      return b.apply(a, c)
    } : function() {
      return b.apply(a, arguments)
    }
  }, indexOf:function(a, b, c) {
    return indexOf$$module$tools.call(a, b, c)
  }, isArray:Array.isArray || function(a) {
    return"[object Array]" == toString$$module$tools.call(a)
  }, keys:Object.keys || function(a) {
    if(a !== Object(a)) {
      throw TypeError();
    }
    var b = [], c;
    for(c in a) {
      hasOwnProperty$$module$tools.call(a, c) && b.push(c)
    }
    return b
  }, map:function(a, b, c) {
    var d = a.length, e = Array(d);
    c && (b = tools$$module$tools.hitch(c, b));
    for(c = 0;c < d;c += 1) {
      e[c] = b(a[c], c, a)
    }
    return e
  }, mixin:function(a, b) {
    var c, d, e = arguments.length;
    for(c = 1;c < e;c += 1) {
      for(d in b = arguments[c] || {}, b) {
        a[d] = b[d]
      }
    }
    return a
  }, offset:function(a) {
    var b = 0, c = 0;
    do {
      b += a.offsetLeft, c += a.offsetTop
    }while(a = a.offsetParent);
    return{left:b, top:c}
  }, reduce:function(a, b, c) {
    var d = 3 > arguments.length, e = a.length;
    d && (c = a[0]);
    for(d = d ? 1 : 0;d < e;d += 1) {
      c = b(c, a[d], d, a)
    }
    return c
  }, removeValueFromArray:function(a, b) {
    for(var c, d = 0, e = 0, f = a.length;e < f;e += 1) {
      c = a[e], c === b ? d += 1 : d && (a[e - d] = c)
    }
    a.length -= d;
    return a
  }};
  module$tools.module$exports = tools$$module$tools;
  module$tools.module$exports && (module$tools = module$tools.module$exports);
  var module$color = {}, tools$$module$color = module$tools, colorMap$$module$color = module$color_map, abs$$module$color = Math.abs, max$$module$color = Math.max, min$$module$color = Math.min, rand$$module$color = Math.random, round$$module$color = Math.round;
  function color$$module$color(a, b) {
    a = color$$module$color.parse(a, b);
    return null === a ? a : new RGBAColor$$module$color(a >> 24 & 255, a >> 16 & 255, a >> 8 & 255, (a >> 0 & 255) / 255)
  }
  color$$module$color.RGBAColor = RGBAColor$$module$color;
  function RGBAColor$$module$color(a, b, c, d) {
    var e = rgbToHsl$$module$color(a, b, c);
    this._properties = {r:a || 0, g:b || 0, b:c || 0, a:null == d ? 1 : d, h:e.h, s:e.s, l:e.l}
  }
  var proto$$module$color = RGBAColor$$module$color.prototype;
  proto$$module$color.red = proto$$module$color.r = getSet$$module$color("r");
  proto$$module$color.green = proto$$module$color.g = getSet$$module$color("g");
  proto$$module$color.blue = proto$$module$color.b = getSet$$module$color("b");
  proto$$module$color.alpha = proto$$module$color.a = getSet$$module$color("a");
  proto$$module$color.hue = proto$$module$color.h = getSet$$module$color("h");
  proto$$module$color.saturation = proto$$module$color.s = getSet$$module$color("s");
  proto$$module$color.lightness = proto$$module$color.l = getSet$$module$color("l");
  function getSet$$module$color(a) {
    return function(b) {
      return 0 < arguments.length ? this.set(a, b) : this.get(a)
    }
  }
  proto$$module$color.set = function(a, b) {
    var c, d = this._properties;
    if(null == b) {
      if(a) {
        for(c in a) {
          this.set(c, a[c])
        }
      }
      return this
    }
    b = +b;
    a = a.charAt(0);
    switch(a) {
      case "r":
      ;
      case "g":
      ;
      case "b":
      ;
      case "a":
        d[a] = b;
        break;
      case "h":
      ;
      case "s":
      ;
      case "l":
        if(1 < b || 0 > b) {
          throw Error("Property: " + a + " must be from 0 to 1");
        }
        d[a] = b;
        c = hslToRgb$$module$color(d.h, d.s, d.l);
        d.r = c >> 24 & 255;
        d.g = c >> 16 & 255;
        d.b = c >> 8 & 255;
        break;
      default:
        throw Error("No support for setting: " + a);
    }
    return this
  };
  proto$$module$color.get = function(a) {
    var b = this._properties;
    switch(a) {
      case "r":
      ;
      case "g":
      ;
      case "b":
        return round$$module$color(b[a]);
      case "a":
        return b[a];
      case "h":
      ;
      case "s":
      ;
      case "l":
        return b[a];
      default:
        throw Error("No support for getting: " + a);
    }
  };
  proto$$module$color.lighter = function(a) {
    var b = this.clone();
    b.set("l", b.get("l") + (null == a ? 0.01 : a));
    return b
  };
  proto$$module$color.darker = function(a) {
    var b = this.clone();
    b.set("l", b.get("l") - (null == a ? 0.01 : a));
    return b
  };
  proto$$module$color.midpoint = function(a) {
    a = color$$module$color(a);
    return new RGBAColor$$module$color((this.r() + a.r()) / 2, (this.g() + a.g()) / 2, (this.b() + a.b()) / 2, (this.a() + a.a()) / 2)
  };
  proto$$module$color.setColorMatrix = function(a) {
    for(var b = [], c = this._properties, d = c.r, e = c.g, f = c.b, c = c.a, g = a.length;g--;) {
      b[g] = +a[g]
    }
    this.set("r", range$$module$color(d * b[0] + e * b[1] + f * b[2] + c * b[3] + 255 * b[4], 0, 255));
    this.set("g", range$$module$color(d * b[5] + e * b[6] + f * b[7] + c * b[8] + 255 * b[9], 0, 255));
    this.set("b", range$$module$color(d * b[10] + e * b[11] + f * b[12] + c * b[13] + 255 * b[14], 0, 255));
    this.set("a", range$$module$color(d * b[15] + e * b[16] + f * b[17] + c * b[18] + b[19], 0, 1));
    return this
  };
  proto$$module$color._setPointAlongRange = function(a, b, c) {
    var a = a.charAt(0), d = this[a]();
    switch(a) {
      case "r":
      ;
      case "g":
      ;
      case "b":
        this.set(a, c ? max$$module$color(0, min$$module$color(255, b * c + (d - c / 2))) : 255 * b);
        break;
      default:
        this.set(a, c ? max$$module$color(0, min$$module$color(1, b * c + d - c / 2)) : b)
    }
    return this
  };
  proto$$module$color.randomize = function(a, b) {
    if(!a || "string" == typeof a) {
      a = a ? [a] : ["r", "g", "b"]
    }
    for(var c = this.clone(), d = a.length;d--;) {
      c._setPointAlongRange(a[d], rand$$module$color(), b)
    }
    return c
  };
  proto$$module$color.clone = function(a) {
    return a ? color$$module$color(+this).set(a) : color$$module$color(+this)
  };
  proto$$module$color.rgba = function() {
    return"rgba(" + [this.r(), this.g(), this.b(), this.a()].join() + ")"
  };
  proto$$module$color.rgb = function() {
    return"rgb(" + [this.r(), this.g(), this.b()].join() + ")"
  };
  proto$$module$color.hsla = function() {
    return"hsla(" + [round$$module$color(360 * this.h()), round$$module$color(100 * this.s()) + "%", round$$module$color(100 * this.l()) + "%", this.a()].join() + ")"
  };
  proto$$module$color.int32 = function() {
    return((this.r() & 255) << 24 | (this.g() & 255) << 16 | (this.b() & 255) << 8 | 255 * this.a() & 255) >>> 0
  };
  proto$$module$color.toString = function() {
    return"0x" + ("0000000" + (((this.r() & 255) << 24 | (this.g() & 255) << 16 | (this.b() & 255) << 8 | 255 * this.a() & 255) >>> 0).toString(16)).slice(-8)
  };
  function hueToRgb$$module$color(a, b, c) {
    c = 0 > c ? c + 1 : 1 < c ? c - 1 : c;
    return 1 > 6 * c ? a + 6 * (b - a) * c : 1 > 2 * c ? b : 2 > 3 * c ? a + 6 * (b - a) * (2 / 3 - c) : a
  }
  function hslToRgb$$module$color(a, b, c) {
    var b = 0.5 >= c ? c * (b + 1) : c + b - c * b, d = 2 * c - b, c = 255 * hueToRgb$$module$color(d, b, a + 1 / 3), e = 255 * hueToRgb$$module$color(d, b, a), a = 255 * hueToRgb$$module$color(d, b, a - 1 / 3);
    return round$$module$color(c) << 24 | round$$module$color(e) << 16 | round$$module$color(a) << 8
  }
  function rgbToHsl$$module$color(a, b, c) {
    var a = a / 255, b = b / 255, c = c / 255, d, e, f, g, h = max$$module$color(a, b, c);
    e = min$$module$color(a, b, c);
    f = (e + h) / 2;
    if(h == e) {
      d = e = 0
    }else {
      g = h - e;
      e = 0.5 < f ? g / (2 - h - e) : g / (h + e);
      switch(h) {
        case a:
          d = (b - c) / g + (b < c ? 6 : 0);
          break;
        case b:
          d = (c - a) / g + 2;
          break;
        case c:
          d = (a - b) / g + 4
      }
      d /= 6
    }
    return{h:d, s:e, l:f}
  }
  function range$$module$color(a, b, c) {
    return min$$module$color(c, max$$module$color(b, a))
  }
  color$$module$color.parse = function(a, b) {
    var c, a = "" + a;
    a in colorMap$$module$color && (a = colorMap$$module$color[a]);
    if(/^#[0-9a-f]{6}$/i.test(a)) {
      a = (parseInt(a.slice(1), 16) << 8 | 255) >>> 0
    }else {
      if(/^#[0-9a-f]{8}$/i.test(a)) {
        a = parseInt(a.slice(1), 16) >>> 0
      }else {
        if(/^#[0-9a-f]{3}$/i.test(a)) {
          var a = parseInt(a.slice(1), 16), d = a & 3840, e = a & 240, f = a & 15, a = (d << 20 | d << 16 | e << 16 | e << 12 | f << 12 | f << 8 | 255) >>> 0
        }
      }
    }
    if(!isNaN(a)) {
      return+a
    }
    a = a.split("(");
    if(2 == a.length) {
      switch(d = a[1].slice(0, -1).split(","), e = d.length, a[0]) {
        case "rgb":
          c = 255;
        case "rgba":
          if(4 == e || 3 == e && c) {
            return((d[0] & 255) << 24 | (d[1] & 255) << 16 | (d[2] & 255) << 8 | (c || 255 * d[3] & 255)) >>> 0
          }
          break;
        case "hsl":
          c = 255;
        case "hsla":
          if(4 == e || 3 == e && c) {
            return a = hslToRgb$$module$color(d[0] % 360 / 360, parseInt(d[1]) / 100, parseInt(d[2]) / 100), a | (c || 255 * d[3] & 255)
          }
      }
    }
    return null == b ? null : color$$module$color.parse(b)
  };
  module$color.module$exports = color$$module$color;
  module$color.module$exports && (module$color = module$color.module$exports);
  var module$event_emitter = {}, tools$$module$event_emitter = module$tools, slice$$module$event_emitter = [].slice, split$$module$event_emitter = "".split;
  function Listener$$module$event_emitter(a, b, c) {
    this.context = a;
    this.listener = b;
    this.times = c || Infinity
  }
  function typeName$$module$event_emitter(a) {
    return":" + a
  }
  var EventEmitter$$module$event_emitter = {addListener:function(a, b, c) {
    2 === arguments.length && (c = b, b = null);
    var d = c instanceof Listener$$module$event_emitter, e = typeof c;
    if("function" != e && "string" != e && !d) {
      throw TypeError("Expected function or string, instead got " + e + ".");
    }
    d || (c = new Listener$$module$event_emitter(b, c));
    for(var d = this._events || (this._events = {}), e = -1, f = split$$module$event_emitter.call(a, " "), g = f.length;++e < g;) {
      a = typeName$$module$event_emitter(f[e]), (d[a] || (d[a] = [])).push(c)
    }
    return this
  }, emitAsync:function(a) {
    var b = this, c = arguments;
    setTimeout(function() {
      b.emit.apply(b, c)
    }, 1)
  }, emit:function(a) {
    var b = this._events, c = b && b[typeName$$module$event_emitter(a)], d = c && c.length;
    if(!c || !d) {
      return this
    }
    for(var e = arguments.length, f = Array(e - 1), b = 1;b < e;b += 1) {
      f[b - 1] = arguments[b]
    }
    e = Array(d);
    for(b = 0;b < d;b += 1) {
      e[b] = c[b]
    }
    for(var g, b = 0;e[b];b += 1) {
      d = e[b], c = d.context, g = d.listener, "string" === typeof g && (g = c[g]), g.apply(c || this, f), g = d.times -= 1, 0 >= g && this.removeListener(a, c, d.listener)
    }
    return this
  }, listeners:function(a) {
    var b = this._events || (this._events = {}), a = typeName$$module$event_emitter(a);
    return b[a] || (b[a] = [])
  }, once:function(a, b, c) {
    2 === arguments.length && (c = b, b = null);
    return this.addListener(a, new Listener$$module$event_emitter(b, c, 1))
  }, removeListener:function(a, b, c) {
    2 === arguments.length && (c = b, b = null);
    for(var d, e, f, g, h = this._events || {}, j = -1, i = split$$module$event_emitter.call(a, " "), k = i.length;++j < k;) {
      d = !1;
      g = h[typeName$$module$event_emitter(i[j])] || [];
      for(f = 0;e = g[f];f += 1) {
        d ? g[f - 1] = e : d = e.listener === c && e.context === b
      }
      d && (g.length -= 1)
    }
    return this
  }, removeAllListeners:function(a) {
    for(var b = this._events || {}, c = !0, d = -1, a = a && split$$module$event_emitter.call(a, " ") || (c = !1, tools$$module$event_emitter.keys(b)), e = a.length;++d < e;) {
      (b[c ? typeName$$module$event_emitter(a[d]) : a[d]] || []).length = 0
    }
    return this
  }};
  EventEmitter$$module$event_emitter.on = EventEmitter$$module$event_emitter.addListener;
  module$event_emitter.module$exports = EventEmitter$$module$event_emitter;
  module$event_emitter.module$exports && (module$event_emitter = module$event_emitter.module$exports);
  var module$asset$asset_loader = {}, EventEmitter$$module$asset$asset_loader = module$event_emitter, tools$$module$asset$asset_loader = module$tools, hitch$$module$asset$asset_loader = tools$$module$asset$asset_loader.hitch;
  function AssetLoader$$module$asset$asset_loader(a) {
    this.pendingAssets = a
  }
  var proto$$module$asset$asset_loader = AssetLoader$$module$asset$asset_loader.prototype = {handleEvent:function(a, b, c) {
    var d = this.pendingAssets, e;
    b in d && (e = d[b], e.notify(a, c), delete d[b])
  }, request:function(a, b, c) {
    this.pendingAssets[a.id] = a;
    this.emit("request", a.id, b, c)
  }, destroyAsset:function(a) {
    this.emit("destroy", a.id)
  }};
  tools$$module$asset$asset_loader.mixin(proto$$module$asset$asset_loader, EventEmitter$$module$asset$asset_loader);
  module$asset$asset_loader.module$exports = AssetLoader$$module$asset$asset_loader;
  module$asset$asset_loader.module$exports && (module$asset$asset_loader = module$asset$asset_loader.module$exports);
  var module$message_channel = {}, EventEmitter$$module$message_channel = module$event_emitter, tools$$module$message_channel = module$tools;
  function MessageChannel$$module$message_channel(a, b) {
    this.disconnect = b;
    this.notifyRenderer = a
  }
  MessageChannel$$module$message_channel.prototype = tools$$module$message_channel.mixin({destroy:function() {
    this.removeAllListeners();
    this.disconnect();
    this.disconnect = this.notifyRenderer = null
  }, notify:function(a) {
    this.emit("message", a)
  }}, EventEmitter$$module$message_channel);
  module$message_channel.module$exports = MessageChannel$$module$message_channel;
  module$message_channel.module$exports && (module$message_channel = module$message_channel.module$exports);
  var module$bootstrapper$context$iframe$context = {}, MessageChannel$$module$bootstrapper$context$iframe$context = module$message_channel, EventEmitter$$module$bootstrapper$context$iframe$context = module$event_emitter, tools$$module$bootstrapper$context$iframe$context = module$tools;
  function IFrameContext$$module$bootstrapper$context$iframe$context(a, b) {
    this.runnerUrl = a;
    this.doc = b
  }
  IFrameContext$$module$bootstrapper$context$iframe$context.prototype = tools$$module$bootstrapper$context$iframe$context.mixin({MessageChannel:MessageChannel$$module$bootstrapper$context$iframe$context, destroy:function() {
    this.notifyRunner({command:"freeze"});
    this.messageChannel.destroy();
    delete this.messageChannel;
    this.removeAllListeners();
    var a = this.frame;
    a.contentDocument.documentElement.innerHTML = "";
    a.parentNode.removeChild(a);
    delete this.frame
  }, init:function(a) {
    var b = this.doc || document, c = this.frame = b.createElement("iframe");
    (b.body || b.documentElement).appendChild(c);
    c.style.display = "none";
    b = this.frameWindow = c.contentWindow;
    c = this.frameDocument = c.contentDocument;
    c.open();
    this.messageChannel = b.messageChannel = new this.MessageChannel(tools$$module$bootstrapper$context$iframe$context.hitch(this, this.notify), function() {
    });
    b.options = a;
    b.isBonsaiMovie = !0;
    var d = this;
    this.messageChannel.on("message", function(a) {
      "scriptLoaded" === a.command && d.emit("scriptLoaded", a.url)
    });
    c.write('<script src="' + this.runnerUrl + '"><\/script>');
    c.close();
    this.doc = this.init = null;
    return this
  }, notify:function(a) {
    this.emit("message", a)
  }, notifyRunner:function(a) {
    this.messageChannel.notify(a)
  }, notifyRunnerAsync:function(a) {
    setTimeout(tools$$module$bootstrapper$context$iframe$context.hitch(this, this.notifyRunner, a), 1)
  }, run:function(a) {
    this.notifyRunner({command:"runScript", code:a})
  }, load:function(a) {
    this.notifyRunner({command:"loadScript", url:a})
  }}, EventEmitter$$module$bootstrapper$context$iframe$context);
  module$bootstrapper$context$iframe$context.module$exports = IFrameContext$$module$bootstrapper$context$iframe$context;
  module$bootstrapper$context$iframe$context.module$exports && (module$bootstrapper$context$iframe$context = module$bootstrapper$context$iframe$context.module$exports);
  var module$renderer$svg$svg_event_handlers = {}, tools$$module$renderer$svg$svg_event_handlers = module$tools, TOUCH_SUPPORT$$module$renderer$svg$svg_event_handlers = "undefined" == typeof document ? !1 : "createTouch" in document;
  function cloneBasicEvent$$module$renderer$svg$svg_event_handlers(a) {
    return tools$$module$renderer$svg$svg_event_handlers.mixin({}, a)
  }
  module$renderer$svg$svg_event_handlers.module$exports = {handleSingleTouch:function(a, b, c) {
    var d = this._getBasicEventData(a), e = d.clientX, f = d.clientY, c = c ? "multi:" : "", g = this._getTarget(a), h = this._getIdOfTarget(g), j = a.type, i = document.elementFromPoint(a.pageX, a.pageY), k = i ? this._getIdOfTarget(i) : 0;
    d.touchId = a.identifier;
    d.touchIndex = a.index;
    switch(j) {
      case "touchstart":
        b.startX = e;
        b.startY = f;
        d = cloneBasicEvent$$module$renderer$svg$svg_event_handlers(d);
        d.type = c + "pointerdown";
        this.emit("userevent", d, h);
        break;
      case "touchmove":
        d.diffX = e - b.startX;
        d.diffY = f - b.startY;
        b.touchMoveHappened = !0;
        d = cloneBasicEvent$$module$renderer$svg$svg_event_handlers(d);
        d.type = c + "drag";
        this.emit("userevent", d, h);
        d = cloneBasicEvent$$module$renderer$svg$svg_event_handlers(d);
        d.type = c + "pointermove";
        this.emit("userevent", d, k);
        break;
      case "touchend":
        if(d = cloneBasicEvent$$module$renderer$svg$svg_event_handlers(d), d.type = c + "pointerup", this.emit("userevent", d, h), g !== i && (d = cloneBasicEvent$$module$renderer$svg$svg_event_handlers(d), this.emit("userevent", d, k)), !b.touchMoveHappened) {
          d = cloneBasicEvent$$module$renderer$svg$svg_event_handlers(d), d.type = "click", this.emit("userevent", d, h)
        }
    }
  }, handleTouchEvent:function(a) {
    var b = [].slice.call(a.touches), c = a.changedTouches, d = this.touchData || (this.touchData = {}), e = a.type;
    b && b.length ? (b[0].type = e, this.handleSingleTouch(b[0], d[b[0].identifier] || (d[b[0].identifier] = {}), !1)) : "touchend" === e && (this.handleSingleTouch(a, {}), this.touchData = {});
    if(c && c.length) {
      for(var f = 0, g = c.length;f < g;++f) {
        a = c[f], a.type = e, a.index = b.indexOf(a), this.handleSingleTouch(a, d[a.identifier] || (d[a.identifier] = {}), !0)
      }
    }
  }, handleEvent:function(a) {
    var b = a.target;
    !this.allowEventDefaults && (b.ownerSVGElement || "svg" === b.nodeName) && a.preventDefault();
    var b = this._getTarget(a), c = this._getIdOfTarget(b), d = a.type;
    if(b && b instanceof HTMLElement) {
      for(;!b._isBSDOMElement;) {
        b = b.parentNode
      }
    }
    var c = c || 0, e = this._getBasicEventData(a), f = e.clientX, g = e.clientY, h = this._lastEventPos || [f, g], j = this._startEventPos || [f, g];
    if(/^touch/.test(a.type)) {
      this.handleTouchEvent(a)
    }else {
      switch(d) {
        case "dblclick":
          d = "doubleclick";
          break;
        case "mousewheel":
          e.delta = a.wheelDelta;
          break;
        case "touchend":
        ;
        case "mouseup":
          c = this._dragId;
          e.diffX = f - j[0];
          e.diffY = g - j[1];
          delete this._currentTouch;
          delete this._dragId;
          delete this._startEventPos;
          delete this._lastEventPos;
          d = "pointerup";
          break;
        case "touchstart":
          if(this._currentTouch) {
            return
          }
          this._currentTouch = a.touches[0].identifier;
        case "mousedown":
          this._dragId = c;
          this._startEventPos = [f, g];
          d = "pointerdown";
          break;
        case "touchmove":
          if(a.touches[0].identifier !== this._currentTouch) {
            return
          }
        ;
        case "mousemove":
          (e = cloneBasicEvent$$module$renderer$svg$svg_event_handlers(e)).type = "pointermove";
          this.emit("userevent", e, c);
          (e = cloneBasicEvent$$module$renderer$svg$svg_event_handlers(e)).type = "multi:pointermove";
          this.emit("userevent", e, c);
          c = this._dragId;
          d = "drag";
          e.diffX = f - j[0];
          e.diffY = g - j[1];
          e.deltaX = f - h[0];
          e.deltaY = g - h[1];
          break;
        case "keypress":
          d = "key";
        case "keyup":
        ;
        case "keydown":
          if(b && !b._isBSDOMElement && document.activeElement !== document.body) {
            return
          }
          e.keyCode = a.keyCode;
          e.ctrlKey = a.ctrlKey;
          e.altKey = a.altKey;
          e.metaKey = a.metaKey;
          e.shiftKey = a.shiftKey;
          e.inputValue = a.target.value
      }
      this._lastEventPos = [f, g];
      e.type = d;
      this.emit("userevent", e, c);
      !TOUCH_SUPPORT$$module$renderer$svg$svg_event_handlers && /drag|pointerup|pointerdown|pointermove/.test(d) && (e = cloneBasicEvent$$module$renderer$svg$svg_event_handlers(e), e.type = "multi:" + d, this.emit("userevent", e, c))
    }
  }, _getTarget:function(a) {
    for(a = a.target;a && null == this._getIdOfTarget(a);) {
      a = a.parentNode
    }
    return a
  }, _getIdOfTarget:function(a) {
    a = a && a.getAttribute && a.getAttribute("data-bs-id");
    return null == a ? null : +a
  }, _getBasicEventData:function(a) {
    var b = this.getOffset(), c = a.clientX || a.touches && a.touches.length && a.touches[0].clientX || 0, a = a.clientY || a.touches && a.touches.length && a.touches[0].clientY || 0, d = c - b.left, b = a - b.top;
    return{stageX:d, stageY:b, x:d, y:b, clientX:c, clientY:a}
  }};
  module$renderer$svg$svg_event_handlers.module$exports && (module$renderer$svg$svg_event_handlers = module$renderer$svg$svg_event_handlers.module$exports);
  var module$renderer$svg$svg_filters = {}, color$$module$renderer$svg$svg_filters = module$color, unshift$$module$renderer$svg$svg_filters = [].unshift, push$$module$renderer$svg$svg_filters = [].push, concat$$module$renderer$svg$svg_filters = [].concat, isWindowEnv$$module$renderer$svg$svg_filters = "undefined" !== typeof window, isFEColorMatrixEnabled$$module$renderer$svg$svg_filters = isWindowEnv$$module$renderer$svg$svg_filters && "SVGFEColorMatrixElement" in window, isFEDropShadowEnabled$$module$renderer$svg$svg_filters = 
  isWindowEnv$$module$renderer$svg$svg_filters && "SVGFEDropShadowElement" in window, isFEMergeEnabled$$module$renderer$svg$svg_filters = isWindowEnv$$module$renderer$svg$svg_filters && "SVGFEMergeElement" in window, isFEBlendEnabled$$module$renderer$svg$svg_filters = isWindowEnv$$module$renderer$svg$svg_filters && "SVGFEBlendElement" in window, isFECompositeEnabled$$module$renderer$svg$svg_filters = isWindowEnv$$module$renderer$svg$svg_filters && "SVGFECompositeElement" in window, isCSSDropShadowEnabled$$module$renderer$svg$svg_filters = 
  isWindowEnv$$module$renderer$svg$svg_filters && "webkitSvgShadow" in window.document.documentElement.style;
  function range$$module$renderer$svg$svg_filters(a, b, c) {
    return Math.min(c, Math.max(b, a))
  }
  function createElement$$module$renderer$svg$svg_filters(a, b, c) {
    a = document.createElementNS("http://www.w3.org/2000/svg", a);
    if(b) {
      for(var d in b) {
        a.setAttribute(d, b[d])
      }
    }
    c && c.appendChild(a);
    return a
  }
  var filterDefs$$module$renderer$svg$svg_filters = {blur:function(a) {
    return createElement$$module$renderer$svg$svg_filters("feGaussianBlur", {stdDeviation:a})
  }, brightness:function(a) {
    var b = createElement$$module$renderer$svg$svg_filters("feComponentTransfer");
    ["R", "G", "B"].forEach(function(c) {
      createElement$$module$renderer$svg$svg_filters("feFunc" + c, {type:"linear", slope:a}, b)
    });
    return b
  }, contrast:function(a) {
    var b = -(0.5 * a + 0.5), c = createElement$$module$renderer$svg$svg_filters("feComponentTransfer");
    ["R", "G", "B"].forEach(function(d) {
      createElement$$module$renderer$svg$svg_filters("feFunc" + d, {type:"linear", slope:a, intercept:b}, c)
    });
    return c
  }, innerShadowByAngle:function(a) {
    var b = a[0], c = a[1];
    return this.innerShadowByOffset([c * Math.cos(b), c * Math.sin(b), a[2], a[3]])
  }, innerShadowByOffset:function(a) {
    var b = a[0], c = a[1], d = a[2], e = color$$module$renderer$svg$svg_filters(a[3]), a = [], b = createElement$$module$renderer$svg$svg_filters("feOffset", {dx:b, dy:c, result:"offset"});
    a.push(b);
    d = createElement$$module$renderer$svg$svg_filters("feGaussianBlur", {stdDeviation:d, "in":"offset", result:"blur"});
    a.push(d);
    d = createElement$$module$renderer$svg$svg_filters("feComposite", {"in":"SourceGraphic", in2:"blur", operator:"out", result:"composite1"});
    a.push(d);
    e = createElement$$module$renderer$svg$svg_filters("feFlood", {"flood-color":e.rgb(), "flood-opacity":e.alpha(), "in":"composite1", result:"flood"});
    a.push(e);
    e = createElement$$module$renderer$svg$svg_filters("feComposite", {"in":"flood", in2:"composite1", operator:"in", result:"composite2"});
    a.push(e);
    e = createElement$$module$renderer$svg$svg_filters("feComposite", {"in":"composite2", in2:"SourceGraphic", operator:"over", result:"composite3"});
    a.push(e);
    return a
  }, dropShadowByAngle:function(a) {
    var b = a[0], c = a[1];
    return this.dropShadowByOffset([c * Math.cos(b), c * Math.sin(b), a[2], a[3]])
  }, dropShadowByOffset:function(a) {
    var b = a[0], c = a[1], d = a[2], e = color$$module$renderer$svg$svg_filters(a[3]), f = 255 === e.int32(), a = [];
    if(isFEDropShadowEnabled$$module$renderer$svg$svg_filters) {
      return createElement$$module$renderer$svg$svg_filters("feDropShadow", {stdDeviation:d, dx:b, dy:c, "flood-color":e.rgb(), "flood-opacity":e.alpha()})
    }
    d = createElement$$module$renderer$svg$svg_filters("feGaussianBlur", {stdDeviation:d, "in":"SourceAlpha", result:"blur"});
    a.push(d);
    f || (d = createElement$$module$renderer$svg$svg_filters("feFlood", {"flood-color":e.rgb(), "flood-opacity":e.alpha(), "in":"blur", result:"flood"}), a.push(d));
    f = createElement$$module$renderer$svg$svg_filters("feComposite", {"in":f ? "blur" : "flood", in2:"blur", operator:"in", result:"composite1"});
    a.push(f);
    b = createElement$$module$renderer$svg$svg_filters("feOffset", {dx:b, dy:c, result:"offset"});
    a.push(b);
    b = createElement$$module$renderer$svg$svg_filters("feComposite", {"in":"SourceGraphic", in2:"offset", operator:"over", result:"composite2"});
    a.push(b);
    return a
  }, grayscale:function(a) {
    a = range$$module$renderer$svg$svg_filters(a, 0, 1);
    return filterDefs$$module$renderer$svg$svg_filters.saturate(a)
  }, hueRotate:function(a) {
    a = range$$module$renderer$svg$svg_filters(a, 0, 360);
    return createElement$$module$renderer$svg$svg_filters("feColorMatrix", {type:"hueRotate", values:a})
  }, invert:function(a) {
    var a = range$$module$renderer$svg$svg_filters(a, 0, 1), b = 1 - a, c = createElement$$module$renderer$svg$svg_filters("feComponentTransfer");
    ["R", "G", "B"].forEach(function(d) {
      createElement$$module$renderer$svg$svg_filters("feFunc" + d, {type:"table", tableValues:a + " " + b}, c)
    });
    return c
  }, opacity:function(a) {
    var a = range$$module$renderer$svg$svg_filters(a, 0, 1), b = createElement$$module$renderer$svg$svg_filters("feComponentTransfer");
    createElement$$module$renderer$svg$svg_filters("feFuncA", {type:"table", tableValues:"0 " + a}, b);
    return b
  }, saturate:function(a) {
    return createElement$$module$renderer$svg$svg_filters("feColorMatrix", {type:"saturate", values:1 - a})
  }, sepia:function(a) {
    a = range$$module$renderer$svg$svg_filters(a, 0, 1);
    a = 1 - a;
    return createElement$$module$renderer$svg$svg_filters("feColorMatrix", {type:"matrix", values:[0.393 + 0.607 * a, 0.769 - 0.769 * a, 0.189 - 0.189 * a, 0, 0, 0.349 - 0.349 * a, 0.686 + 0.314 * a, 0.168 - 0.168 * a, 0, 0, 0.272 - 0.272 * a, 0.534 - 0.534 * a, 0.131 + 0.869 * a, 0, 0, 0, 0, 0, 1, 0].join(" ")})
  }, colorMatrix:function(a) {
    return createElement$$module$renderer$svg$svg_filters("feColorMatrix", {type:"matrix", values:a.join(" ")})
  }};
  function containsFlattenFilter$$module$renderer$svg$svg_filters(a) {
    for(var a = a || [], b, c = 0, d = a.length;c < d;c += 1) {
      if(b = a[c], isFEMergeEnabled$$module$renderer$svg$svg_filters && b instanceof window.SVGFEMergeElement || isFEBlendEnabled$$module$renderer$svg$svg_filters && b instanceof window.SVGFEBlendElement || isFECompositeEnabled$$module$renderer$svg$svg_filters && b instanceof window.SVGFECompositeElement) {
        return!0
      }
    }
    return!1
  }
  function filterElementsFromList$$module$renderer$svg$svg_filters(a) {
    for(var a = a || [], b, c = [], d = 0, e = a.length;d < e;d += 1) {
      b = a[d], "function" === typeof filterDefs$$module$renderer$svg$svg_filters[b.type] && (b = concat$$module$renderer$svg$svg_filters.call([], filterDefs$$module$renderer$svg$svg_filters[b.type](b.value)), containsFlattenFilter$$module$renderer$svg$svg_filters(b) && 0 < d ? unshift$$module$renderer$svg$svg_filters.apply(c, b) : push$$module$renderer$svg$svg_filters.apply(c, b))
    }
    return c
  }
  var svgFilters$$module$renderer$svg$svg_filters = {create:function(a, b) {
    return filterDefs$$module$renderer$svg$svg_filters[a](b)
  }, containsFlattenFilter:containsFlattenFilter$$module$renderer$svg$svg_filters, filterElementsFromList:filterElementsFromList$$module$renderer$svg$svg_filters, isFEColorMatrixEnabled:isFEColorMatrixEnabled$$module$renderer$svg$svg_filters};
  module$renderer$svg$svg_filters.module$exports = svgFilters$$module$renderer$svg$svg_filters;
  module$renderer$svg$svg_filters.module$exports && (module$renderer$svg$svg_filters = module$renderer$svg$svg_filters.module$exports);
  var module$runner$animation$color_translations = {}, color$$module$runner$animation$color_translations = module$color;
  module$runner$animation$color_translations.module$exports = {strokeColor:makeColorTranslationSpec$$module$runner$animation$color_translations("strokeColor"), fillColor:makeColorTranslationSpec$$module$runner$animation$color_translations("fillColor")};
  function makeColorTranslationSpec$$module$runner$animation$color_translations(a) {
    return{setup:function(b) {
      var c = color$$module$runner$animation$color_translations(b[a]);
      b[a + "_r"] = c.r();
      b[a + "_g"] = c.g();
      b[a + "_b"] = c.b();
      b[a + "_a"] = c.a();
      delete b[a]
    }, step:function(b) {
      b[a] = "" + new color$$module$runner$animation$color_translations.RGBAColor(b[a + "_r"], b[a + "_g"], b[a + "_b"], b[a + "_a"]);
      delete b[a + "_r"];
      delete b[a + "_g"];
      delete b[a + "_b"];
      delete b[a + "_a"]
    }}
  }
  module$runner$animation$color_translations.module$exports && (module$runner$animation$color_translations = module$runner$animation$color_translations.module$exports);
  var module$runner$animation$gradient_translations = {}, color$$module$runner$animation$gradient_translations = module$color;
  function translation$$module$runner$animation$gradient_translations(a) {
    return{setup:function(b) {
      var c = b[a].stops, d;
      this[a] = b[a].clone();
      b[a].matrix && (b[a + "MatrixA"] = b[a].matrix.a, b[a + "MatrixB"] = b[a].matrix.b, b[a + "MatrixC"] = b[a].matrix.c, b[a + "MatrixD"] = b[a].matrix.d, b[a + "MatrixTX"] = b[a].matrix.tx, b[a + "MatrixTY"] = b[a].matrix.ty);
      "linear-gradient" === b[a].type ? isNaN(b[a].direction) || (b[a + "Direction"] = b[a].direction) : (this[a + "RadiusUnit"] = (("" + b[a].radius).match(/\D$/) || [""])[0], b[a + "Radius"] = parseFloat(b[a].radius));
      for(var e = 0, f = c.length;e < f;++e) {
        d = color$$module$runner$animation$gradient_translations(c[e][0]), b[a + "Stop_" + e + "r"] = d.r(), b[a + "Stop_" + e + "g"] = d.g(), b[a + "Stop_" + e + "b"] = d.b(), b[a + "Stop_" + e + "a"] = d.a(), isNaN(c[e][1]) || (b[a + "Stop_" + e + "_pos"] = c[e][1])
      }
      delete b[a]
    }, step:function(b) {
      this[a].matrix && (this[a].matrix.a = b[a + "MatrixA"], this[a].matrix.b = b[a + "MatrixB"], this[a].matrix.c = b[a + "MatrixC"], this[a].matrix.d = b[a + "MatrixD"], this[a].matrix.tx = b[a + "MatrixTX"], this[a].matrix.ty = b[a + "MatrixTY"]);
      "linear-gradient" === this[a].type ? (isNaN(b[a + "Direction"]) || (this[a].direction = b[a + "Direction"]), delete b[a + "Direction"]) : (this[a].radius = b[a + "Radius"] + this[a + "RadiusUnit"], delete b[a + "Radius"]);
      for(var c = this[a].stops, d = 0, e = c.length;d < e;++d) {
        c[d][0] = +new color$$module$runner$animation$gradient_translations.RGBAColor(b[a + "Stop_" + d + "r"], b[a + "Stop_" + d + "g"], b[a + "Stop_" + d + "b"], b[a + "Stop_" + d + "a"]), c[d][1] = b[a + "Stop_" + d + "_pos"], delete b[a + "Stop_" + d + "r"], delete b[a + "Stop_" + d + "g"], delete b[a + "Stop_" + d + "b"], delete b[a + "Stop_" + d + "a"], delete b[a + "Stop_" + d + "_pos"]
      }
      b[a] = this[a]
    }}
  }
  module$runner$animation$gradient_translations.module$exports = {fillGradient:translation$$module$runner$animation$gradient_translations("fillGradient"), strokeGradient:translation$$module$runner$animation$gradient_translations("strokeGradient")};
  module$runner$animation$gradient_translations.module$exports && (module$runner$animation$gradient_translations = module$runner$animation$gradient_translations.module$exports);
  var module$runner$animation$segment_translations = {}, color$$module$runner$animation$segment_translations = module$color;
  module$runner$animation$segment_translations.module$exports = {segments:{setupTo:function(a) {
    for(var b = a.segments, c = 0, d = b.length;c < d;++c) {
      for(var e = b[c], f = 0, g = e.length;f < g;++f) {
        isNaN(e[f]) || (a["segment_" + c + "_" + f] = e[f])
      }
    }
  }, setupFrom:function(a) {
    var b = a.segments;
    this._segments = b;
    for(var c = 0, d = b.length;c < d;++c) {
      for(var e = b[c], f = 0, g = e.length;f < g;++f) {
        isNaN(e[f]) || (a["segment_" + c + "_" + f] = e[f])
      }
    }
    delete a.segments
  }, step:function(a) {
    for(var b = this._segments, c = 0, d = b.length;c < d;++c) {
      for(var e = b[c], f = 0, g = e.length;f < g;++f) {
        isNaN(a["segment_" + c + "_" + f]) || (e[f] = a["segment_" + c + "_" + f], delete a["segment_" + c + "_" + f])
      }
    }
    a.segments = b
  }}};
  module$runner$animation$segment_translations.module$exports && (module$runner$animation$segment_translations = module$runner$animation$segment_translations.module$exports);
  var module$runner$display_list = {}, tools$$module$runner$display_list = module$tools, max$$module$runner$display_list = Math.max, min$$module$runner$display_list = Math.min, reduce$$module$runner$display_list = tools$$module$runner$display_list.reduce, removeValueFromArray$$module$runner$display_list = tools$$module$runner$display_list.removeValueFromArray, DisplayList$$module$runner$display_list = {addChild:function(a, b) {
    var c = 0 <= b;
    if(tools$$module$runner$display_list.isArray(a)) {
      return c && a.reverse(), tools$$module$runner$display_list.forEach(a, function(a) {
        c ? this.addChild(a, b) : this.addChild(a)
      }, this), this
    }
    var d = this.stage;
    a.parent && a.parent.removeChild(a);
    var e = !a.stage && d;
    a.parent = this;
    var f = this._children || (this._children = []), g = f.length;
    c ? f[b] ? (f.splice(b, 0, a), g += 1) : f[b] = a : (b = f.push(a) - 1, g += 1);
    var h, j, i;
    for(h = b - 1;0 <= h && !(i = f[h]);h -= 1) {
    }
    if(i) {
      j = i.next, i.next = a
    }else {
      for(h = b + 1;h < g && !(j = f[h]);h += 1) {
      }
    }
    j && (a.next = j);
    h = (g = d && d.registry) && g.displayObjects;
    j = g && g.movies.add;
    i = g && g.needsInsertion;
    if(e) {
      var e = a, k = [], l = k.push, m = 0;
      do {
        e._activate(d);
        e.markUpdate();
        if(g) {
          var n = e.id;
          h[n] = e;
          i[n] = e;
          "function" == typeof e.emitFrame && j(e)
        }
        (f = e._children) && l.apply(k, removeValueFromArray$$module$runner$display_list(f.slice()))
      }while(e = k[m++])
    }else {
      a._activate(d), i && (i[a.id] = a), a.markUpdate()
    }
    return this
  }, children:function(a, b) {
    if(!a) {
      var c = this._children;
      return c ? c.slice() : []
    }
    this.clear();
    return this.addChild.apply(this, arguments)
  }, clear:function() {
    var a = this._children;
    a && a.slice(0).map(this.removeChild, this);
    return this
  }, getComputed:function(a) {
    var b = this._children || (this._children = []), c = !0;
    if("top" === a || "right" === a || "bottom" === a || "left" === a) {
      var d = "top" === a || "bottom" === a ? "y" : "x", e = "top" === a || "left" === a ? min$$module$runner$display_list : max$$module$runner$display_list;
      return tools$$module$runner$display_list.reduce(b, function(b, g) {
        if(!g) {
          return b
        }
        var h = g.attr(d) + g.getComputed(a);
        return c ? (c = !1, h) : e(b, h)
      }, 0)
    }
    b = tools$$module$runner$display_list.reduce(b, function(a, b) {
      if(!b) {
        return a
      }
      var d = b.getComputed("size"), e = b.attr("x"), i = b.attr("y"), k = i + d.top;
      a.top = c ? k : min$$module$runner$display_list(a.top, k);
      k = e + d.right;
      a.right = c ? k : max$$module$runner$display_list(a.right, k);
      i += d.bottom;
      a.bottom = c ? i : max$$module$runner$display_list(a.bottom, i);
      d = e + d.left;
      a.left = c ? d : min$$module$runner$display_list(a.left, d);
      c = !1;
      return a
    }, {top:0, right:0, bottom:0, left:0, width:0, height:0});
    b.height = b.bottom - b.top;
    b.width = b.right - b.left;
    return"size" === a ? b : b[a]
  }, getIndexOfChild:function(a) {
    var b = this._children;
    return b ? b.indexOf(a) : -1
  }, removeChild:function(a, b) {
    var c = this._children, d = c ? c.indexOf(a) : -1;
    if(-1 == d) {
      return this
    }
    for(var e = d - 1;0 <= e;e -= 1) {
      var f = c[e];
      if(f) {
        f.next = a.next;
        break
      }
    }
    a.next ? "keepIndexes" === b ? delete c[d] : c.splice(d, 1) : c.length = d;
    delete a.parent;
    delete a.next;
    var g, f = (e = (d = a.stage) && d.registry) && e.displayObjects, h = e && e.movies.remove, j = e && e.needsInsertion, i = a, k = [], l = k.push;
    if(d) {
      a.markUpdate();
      d = 0;
      do {
        e && (h(i), g = i.id, delete f[g], delete j[g]), i._deactivate(), (c = i._children) && l.apply(k, removeValueFromArray$$module$runner$display_list(c.slice()))
      }while(i = k[d++])
    }
    return this
  }};
  module$runner$display_list.module$exports = DisplayList$$module$runner$display_list;
  module$runner$display_list.module$exports && (module$runner$display_list = module$runner$display_list.module$exports);
  var module$runner$filter$builtin = {}, filter$$module$runner$filter$builtin = module$runner$filter$base_filter, tools$$module$runner$filter$builtin = module$tools, color$$module$runner$filter$builtin = module$color;
  filter$$module$runner$filter$builtin.Blur = function(a) {
    return new filter$$module$runner$filter$builtin.BaseFilter("blur", a, 1)
  };
  filter$$module$runner$filter$builtin.createFactory("blur", filter$$module$runner$filter$builtin.Blur);
  filter$$module$runner$filter$builtin.Brightness = function(a) {
    return new filter$$module$runner$filter$builtin.BaseFilter("brightness", a, 2)
  };
  filter$$module$runner$filter$builtin.createFactory("brightness", filter$$module$runner$filter$builtin.Brightness);
  filter$$module$runner$filter$builtin.ColorMatrix = function(a) {
    return new filter$$module$runner$filter$builtin.BaseFilter("colorMatrix", a, [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0])
  };
  filter$$module$runner$filter$builtin.createFactory("colorMatrix", filter$$module$runner$filter$builtin.ColorMatrix);
  filter$$module$runner$filter$builtin.Contrast = function(a) {
    return new filter$$module$runner$filter$builtin.BaseFilter("contrast", a, 2)
  };
  filter$$module$runner$filter$builtin.createFactory("contrast", filter$$module$runner$filter$builtin.Contrast);
  filter$$module$runner$filter$builtin.DropShadow = function(a, b, c, d) {
    d = color$$module$runner$filter$builtin.parse(d, 0);
    return/deg$/.test(a) ? (a = Math.PI / 180 * parseFloat(a), new filter$$module$runner$filter$builtin.BaseFilter("dropShadowByAngle", [a, b, c, d], [0, 0, 0, 255])) : new filter$$module$runner$filter$builtin.BaseFilter("dropShadowByOffset", [a, b, c, d], [0, 0, 0, 255])
  };
  filter$$module$runner$filter$builtin.createFactory("dropShadow", filter$$module$runner$filter$builtin.DropShadow);
  filter$$module$runner$filter$builtin.Grayscale = function(a) {
    return new filter$$module$runner$filter$builtin.BaseFilter("grayscale", a, 1)
  };
  filter$$module$runner$filter$builtin.createFactory("grayscale", filter$$module$runner$filter$builtin.Grayscale);
  filter$$module$runner$filter$builtin.HueRotate = function(a) {
    return new filter$$module$runner$filter$builtin.BaseFilter("hueRotate", a, 90)
  };
  filter$$module$runner$filter$builtin.createFactory("hueRotate", filter$$module$runner$filter$builtin.HueRotate);
  filter$$module$runner$filter$builtin.Invert = function(a) {
    return new filter$$module$runner$filter$builtin.BaseFilter("invert", a, 1)
  };
  filter$$module$runner$filter$builtin.createFactory("invert", filter$$module$runner$filter$builtin.Invert);
  filter$$module$runner$filter$builtin.Opacity = function(a) {
    return new filter$$module$runner$filter$builtin.BaseFilter("opacity", a, 0.5)
  };
  filter$$module$runner$filter$builtin.createFactory("opacity", filter$$module$runner$filter$builtin.Opacity);
  filter$$module$runner$filter$builtin.Saturate = function(a) {
    return new filter$$module$runner$filter$builtin.BaseFilter("saturate", a, 5)
  };
  filter$$module$runner$filter$builtin.createFactory("saturate", filter$$module$runner$filter$builtin.Saturate);
  filter$$module$runner$filter$builtin.Sepia = function(a) {
    return new filter$$module$runner$filter$builtin.BaseFilter("sepia", a, 1)
  };
  filter$$module$runner$filter$builtin.createFactory("sepia", filter$$module$runner$filter$builtin.Sepia);
  module$runner$filter$builtin.module$exports = filter$$module$runner$filter$builtin;
  module$runner$filter$builtin.module$exports && (module$runner$filter$builtin = module$runner$filter$builtin.module$exports);
  var module$runner$animation$filter_translations = {}, tools$$module$runner$animation$filter_translations = module$tools, filter$$module$runner$animation$filter_translations = module$runner$filter$builtin, color$$module$runner$animation$filter_translations = module$color, prefix$$module$runner$animation$filter_translations = "filter_";
  function setupFilterValues$$module$runner$animation$filter_translations(a, b, c) {
    if(null != a) {
      if(a instanceof filter$$module$runner$animation$filter_translations.BaseFilter) {
        if(tools$$module$runner$animation$filter_translations.isArray(a.value)) {
          for(var d = 0, e = a.value.length;d < e;++d) {
            if(("dropShadowByOffset" === a.type || "dropShadowByAngle" === a.type) && 3 === d) {
              var f = color$$module$runner$animation$filter_translations(a.value[d]);
              c[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_r"] = f.r();
              c[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_g"] = f.g();
              c[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_b"] = f.b();
              c[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_a"] = f.a()
            }else {
              c[prefix$$module$runner$animation$filter_translations + b + "_" + d] = a.value[d]
            }
          }
        }else {
          c[prefix$$module$runner$animation$filter_translations + b] = a.value
        }
      }else {
        c[prefix$$module$runner$animation$filter_translations + b] = a
      }
    }
  }
  module$runner$animation$filter_translations.module$exports = {filters:{setupTo:function(a) {
    tools$$module$runner$animation$filter_translations.isArray(a.filters) || (a.filters = [a.filters]);
    for(var b = 0, c = a.filters.length;b < c;b++) {
      setupFilterValues$$module$runner$animation$filter_translations(a.filters[b], b, a)
    }
    this._to = a.filters;
    delete a.filters
  }, setupFrom:function(a) {
    for(var b = 0, c = this._to.length;b < c;b++) {
      setupFilterValues$$module$runner$animation$filter_translations(a.filters[b], b, a)
    }
    this._filters = a.filters;
    delete a.filters
  }, step:function(a) {
    for(var b = 0, c = this._to.length;b < c;b++) {
      if(null != this._to[b]) {
        if(null != a[prefix$$module$runner$animation$filter_translations + b]) {
          this._filters[b].value = a[prefix$$module$runner$animation$filter_translations + b], delete a[prefix$$module$runner$animation$filter_translations + b]
        }else {
          for(var d = 0, e = this._to[b].value.length;d < e;++d) {
            if(("dropShadowByOffset" === this._to[b].type || "dropShadowByAngle" === this._to[b].type) && 3 === d) {
              var f = Number(new color$$module$runner$animation$filter_translations.RGBAColor(a[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_r"], a[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_g"], a[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_b"], a[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_a"]));
              delete a[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_r"];
              delete a[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_g"];
              delete a[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_b"];
              delete a[prefix$$module$runner$animation$filter_translations + b + "_" + d + "_a"];
              this._filters[b].value[d] = f
            }else {
              this._filters[b].value[d] = a[prefix$$module$runner$animation$filter_translations + b + "_" + d], delete a[prefix$$module$runner$animation$filter_translations + b + "_" + d]
            }
          }
        }
      }
    }
    a.filters = this._filters
  }}};
  module$runner$animation$filter_translations.module$exports && (module$runner$animation$filter_translations = module$runner$animation$filter_translations.module$exports);
  var module$runner$gradient = {}, tools$$module$runner$gradient = module$tools, color$$module$runner$gradient = module$color, Matrix$$module$runner$gradient = module$runner$matrix, hasOwn$$module$runner$gradient = {}.hasOwnProperty;
  function gradient$$module$runner$gradient(a) {
    return a instanceof gradient$$module$runner$gradient.LinearGradient || a instanceof gradient$$module$runner$gradient.RadialGradient ? a : gradient$$module$runner$gradient.parse(a)
  }
  gradient$$module$runner$gradient.DEFAULT_UNITS = "boundingBox";
  gradient$$module$runner$gradient.LinearGradient = function(a, b, c, d) {
    this.type = "linear-gradient";
    this.stops = b;
    this.matrix = c;
    this.direction = a;
    this.units = d
  };
  gradient$$module$runner$gradient.LinearGradient.prototype.clone = function() {
    var a = [];
    this.stops.forEach(function(b) {
      a.push([b[0], b[1]])
    });
    return new gradient$$module$runner$gradient.LinearGradient(this.direction, a, this.matrix && this.matrix.clone(), this.units)
  };
  gradient$$module$runner$gradient.RadialGradient = function(a, b, c, d, e, f) {
    this.type = "radial-gradient";
    this.stops = a;
    this.radius = b;
    this.matrix = c;
    this.units = d;
    this.fx = e;
    this.fy = f
  };
  gradient$$module$runner$gradient.RadialGradient.prototype.clone = function() {
    var a = [];
    this.stops.forEach(function(b) {
      a.push([b[0], b[1]])
    });
    return new gradient$$module$runner$gradient.RadialGradient(a, this.radius, this.matrix && this.matrix.clone(), this.units, this.fx, this.fy)
  };
  gradient$$module$runner$gradient._repeat = function(a, b) {
    for(var c = a.length, d, e, f = [], g = 0;g < b;++g) {
      for(var h = 0;h < c;++h) {
        e = a[h].slice(0), d = 100 / b * g, e[1] = e[1] / b + d, f.push(e)
      }
    }
    return f
  };
  gradient$$module$runner$gradient._fillOffsets = function(a) {
    var b, c, d = a.length - 1;
    if(a && a.length) {
      a[0][1] = a[0][1] || 0;
      a[d][1] = null == a[d][1] ? 100 : a[d][1];
      b = a[0][1];
      for(var e = 1;e < d;++e) {
        if(a[e][1]) {
          b = parseFloat(a[e][1])
        }else {
          c = b;
          b = null;
          for(var f = e + 1;f < d;++f) {
            if(a[f][1]) {
              b = a[f][1];
              break
            }
          }
          (b = parseFloat(b)) || (b = a[d][1]);
          for(var g = (b - c) / (f - e + 1);e < f;++e) {
            c += g, a[e][1] = c
          }
        }
      }
      return a
    }
  };
  gradient$$module$runner$gradient.linear = function(a, b, c) {
    return gradient$$module$runner$gradient.advancedLinear(a, b, null, c)
  };
  gradient$$module$runner$gradient.radial = function(a, b, c, d, e) {
    return gradient$$module$runner$gradient.advancedRadial(a, (b || 50) + "%", new Matrix$$module$runner$gradient(1, 0, 0, 1, null == c ? 0.5 : c / 100, null == d ? 0.5 : d / 100), e)
  };
  gradient$$module$runner$gradient.advancedLinear = function(a, b, c, d, e) {
    var e = e || gradient$$module$runner$gradient.DEFAULT_UNITS, f = parseFloat(a);
    tools$$module$runner$gradient.isArray(a) ? f = a : isNaN(f) && (f = angleMap$$module$runner$gradient[a]);
    if(!tools$$module$runner$gradient.isArray(b)) {
      var a = [], g;
      for(g in b) {
        hasOwn$$module$runner$gradient.call(b, g) && a.push([b[g], parseFloat(g)])
      }
      b = a;
      b.sort(function(a, b) {
        return a[1] - b[1]
      })
    }
    b = b.map(function(a) {
      return tools$$module$runner$gradient.isArray(a) ? [color$$module$runner$gradient.parse(a[0]), a[1]] : [color$$module$runner$gradient.parse(a)]
    });
    gradient$$module$runner$gradient._fillOffsets(b);
    d && (b = gradient$$module$runner$gradient._repeat(b, d));
    return new gradient$$module$runner$gradient.LinearGradient(f, b, c, e)
  };
  gradient$$module$runner$gradient.advancedRadial = function(a, b, c, d, e, f, g) {
    e = e || gradient$$module$runner$gradient.DEFAULT_UNITS;
    f = f || 0;
    g = g || 0;
    b = null == b ? "50%" : b;
    if(!tools$$module$runner$gradient.isArray(a)) {
      var h = [], j;
      for(j in a) {
        hasOwn$$module$runner$gradient.call(a, j) && h.push([a[j], parseFloat(j)])
      }
      a = h;
      a.sort(function(a, b) {
        return a[1] - b[1]
      })
    }
    a = a.map(function(a) {
      return tools$$module$runner$gradient.isArray(a) ? [color$$module$runner$gradient.parse(a[0]), a[1]] : [color$$module$runner$gradient.parse(a)]
    });
    gradient$$module$runner$gradient._fillOffsets(a);
    d && (a = gradient$$module$runner$gradient._repeat(a, d));
    return new gradient$$module$runner$gradient.RadialGradient(a, b, c, e, f, g)
  };
  gradient$$module$runner$gradient.parse = function(a) {
    var b = a.match(/(linear)-gradient\((.+)\)$/);
    if(b && "linear" === b[1]) {
      return gradient$$module$runner$gradient.parseLinearGradient(b[2])
    }
    throw Error("Invalid gradient: " + a);
  };
  var angleMap$$module$runner$gradient = {top:0, right:90, bottom:180, left:270, "top left":315, "top right":45, "bottom left":225, "bottom right":135};
  gradient$$module$runner$gradient.parseLinearGradient = function(a) {
    for(var b = a.match(/^\s*(?:(-?(?:[0-9]+\.)?[0-9]+)deg|to\s+((?:(?:top|bottom)\s*)?(?:left|right)|(?:top|bottom)))/) || ["", , "bottom"], c = b[1], d = b[2], e = /(?:,|^)\s*(#[0-9a-f]{3,8}|(?:hsl|rgb)a?\(.+?\)|\w+)\s*((?:[0-9]+\.)?[0-9]+%|)?/ig, f = [], a = a.slice(b[0].length);b = e.exec(a);) {
      f.push([b[1], parseFloat(b[2]) || null])
    }
    return gradient$$module$runner$gradient.linear(c || d, f)
  };
  module$runner$gradient.module$exports = gradient$$module$runner$gradient;
  module$runner$gradient.module$exports && (module$runner$gradient = module$runner$gradient.module$exports);
  var module$runner$path$curved_path = {}, Point$$module$runner$path$curved_path = module$point, tools$$module$runner$path$curved_path = module$tools, abs$$module$runner$path$curved_path = Math.abs, atan2$$module$runner$path$curved_path = Math.atan2, asin$$module$runner$path$curved_path = Math.asin, ceil$$module$runner$path$curved_path = Math.ceil, cos$$module$runner$path$curved_path = Math.cos, max$$module$runner$path$curved_path = Math.max, min$$module$runner$path$curved_path = Math.min, PI$$module$runner$path$curved_path = 
  Math.PI, pow$$module$runner$path$curved_path = Math.pow, sqrt$$module$runner$path$curved_path = Math.sqrt, sin$$module$runner$path$curved_path = Math.sin, tan$$module$runner$path$curved_path = Math.tan;
  function CurvedPath$$module$runner$path$curved_path() {
    this._segments = [];
    this.requiredCurves = 0;
    this.currentPoint = new Point$$module$runner$path$curved_path(0, 0);
    this.lastMoveTo = new Point$$module$runner$path$curved_path(0, 0)
  }
  var proto$$module$runner$path$curved_path = CurvedPath$$module$runner$path$curved_path.prototype;
  proto$$module$runner$path$curved_path.clear = function() {
    this._segments.length = 0
  };
  proto$$module$runner$path$curved_path._push = function() {
    var a = [].slice.call(arguments);
    a.from = this.currentPoint.clone();
    a.lastMoveTo = this.lastMoveTo.clone();
    this._segments.push(a);
    return this
  };
  proto$$module$runner$path$curved_path.moveTo = function(a, b) {
    this._push("moveTo", a, b);
    this.currentPoint = new Point$$module$runner$path$curved_path(a, b);
    this.lastMoveTo = new Point$$module$runner$path$curved_path(a, b);
    return this
  };
  proto$$module$runner$path$curved_path.moveBy = function(a, b) {
    var c = this.currentPoint;
    return this.moveTo(c.x + a, c.y + b)
  };
  proto$$module$runner$path$curved_path.closePath = function() {
    this._push("closePath");
    this.currentPoint = this.lastMoveTo.clone();
    return this
  };
  proto$$module$runner$path$curved_path.lineTo = function(a, b) {
    var c = this.currentPoint;
    this._push("curveTo", c.x, c.y, a, b, a, b);
    this.currentPoint = new Point$$module$runner$path$curved_path(a, b);
    return this
  };
  proto$$module$runner$path$curved_path.lineBy = function(a, b) {
    var c = this.currentPoint;
    return this.lineTo(c.x + a, c.y + b)
  };
  proto$$module$runner$path$curved_path.curveTo = function(a, b, c, d, e, f) {
    this._push("curveTo", a, b, c, d, e, f);
    this.currentPoint = new Point$$module$runner$path$curved_path(e, f);
    return this
  };
  proto$$module$runner$path$curved_path.curveBy = function(a, b, c, d, e, f) {
    var g = this.currentPoint.x, h = this.currentPoint.y;
    return this.curveTo(g + a, h + b, g + c, h + d, g + e, h + f)
  };
  proto$$module$runner$path$curved_path.arcTo = function(a, b, c, d, e, f, g) {
    var h, j, i = this.currentPoint.x, k = this.currentPoint.y, b = propertiesFromAbsoluteArc$$module$runner$path$curved_path(i, k, a, b, c, d, e, f, g), c = b.cx, d = b.cy, e = b.startAngle;
    h = b.endAngle - e;
    a = b.rx;
    b = b.ry;
    j = ceil$$module$runner$path$curved_path(abs$$module$runner$path$curved_path(h) / (PI$$module$runner$path$curved_path / 2));
    h /= j;
    for(var l = 0;l < j;++l) {
      var m = m || i, n = n || k, o = e + h * l, p = o + h, q = 4 / 3 * tan$$module$runner$path$curved_path((p - o) / 4), r = c + a * cos$$module$runner$path$curved_path(p), s = d + b * sin$$module$runner$path$curved_path(p), t = m + q * a * -sin$$module$runner$path$curved_path(o), o = n + q * b * cos$$module$runner$path$curved_path(o), u = r + q * a * sin$$module$runner$path$curved_path(p), p = s + q * b * -cos$$module$runner$path$curved_path(p), m = r, n = s;
      this._push("curveTo", t, o, u, p, r, s)
    }
    this.currentPoint = new Point$$module$runner$path$curved_path(f, g);
    return this
  };
  proto$$module$runner$path$curved_path.arcBy = function(a, b, c, d, e, f, g) {
    var h = this.currentPoint;
    return this.arcTo(a, b, c, d, e, f + h.x, g + h.y)
  };
  proto$$module$runner$path$curved_path.quadraticCurveTo = function(a, b, c, d) {
    var e = 1 / 3, f = 2 / 3, g = this.currentPoint;
    this._push("curveTo", e * g.x + f * a, e * g.y + f * b, e * c + f * a, e * d + f * b, c, d);
    this.currentPoint = new Point$$module$runner$path$curved_path(c, d);
    return this
  };
  proto$$module$runner$path$curved_path.quadraticCurveBy = function(a, b, c, d) {
    var e = this.currentPoint;
    return this.quadraticCurveTo(a + e.x, b + e.y, c + e.x, d + e.y)
  };
  proto$$module$runner$path$curved_path.nullCurve = function(a) {
    var a = null == a ? this._segments.length - 1 : a, b, c, d, e = this._segments[a];
    e ? (c = e[e.length - 2], d = e[e.length - 1]) : c = d = 0;
    b = ["curveTo", c, d, c, d, c, d];
    b.from = new Point$$module$runner$path$curved_path(c, d);
    b.lastMoveTo = e ? e.lastMoveTo.clone() : new Point$$module$runner$path$curved_path(0, 0);
    this._segments.splice(a + 1, 0, b);
    return this
  };
  proto$$module$runner$path$curved_path.splitCurve = function(a) {
    var b, c, d = this._segments[a], e = [];
    if(!d || 7 > d.length) {
      return this
    }
    c = splitAbsoluteCubicBezier$$module$runner$path$curved_path(d.from.clone(), new Point$$module$runner$path$curved_path(d[1], d[2]), new Point$$module$runner$path$curved_path(d[3], d[4]), new Point$$module$runner$path$curved_path(d[5], d[6]), 0.5);
    b = c.left;
    c = c.right;
    var f = ["curveTo", b[1].x, b[1].y, b[2].x, b[2].y, b[3].x, b[3].y];
    f.from = b[0].clone();
    f.lastMoveTo = d.lastMoveTo.clone();
    e.push(f);
    b = ["curveTo", c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y];
    b.from = c[0].clone();
    b.lastMoveTo = d.lastMoveTo.clone();
    e.push(b);
    this._segments.splice(a, 1, f, b);
    return this
  };
  CurvedPath$$module$runner$path$curved_path.propertiesFromAbsoluteArc = propertiesFromAbsoluteArc$$module$runner$path$curved_path;
  function propertiesFromAbsoluteArc$$module$runner$path$curved_path(a, b, c, d, e, f, g, h, j) {
    var f = !!f, g = !!g, i = e * PI$$module$runner$path$curved_path / 180, k = cos$$module$runner$path$curved_path(i), l = pow$$module$runner$path$curved_path(c, 2), m = pow$$module$runner$path$curved_path(d, 2), i = sin$$module$runner$path$curved_path(i), n = (a - h) / 2, o = (b - j) / 2, p = k * n + i * o, q = -i * n + k * o, r;
    r = pow$$module$runner$path$curved_path(p, 2);
    var s = pow$$module$runner$path$curved_path(q, 2), n = pow$$module$runner$path$curved_path(n, 2) / l + pow$$module$runner$path$curved_path(o, 2) / m;
    if(1 < n) {
      return c *= sqrt$$module$runner$path$curved_path(n), d *= sqrt$$module$runner$path$curved_path(n), propertiesFromAbsoluteArc$$module$runner$path$curved_path(a, b, c, d, e, f, g, h, j)
    }
    e = (l * m - l * s - m * r) / (l * s + m * r);
    0 > e ? (c /= d, e = s + r / pow$$module$runner$path$curved_path(c, 2), d = sqrt$$module$runner$path$curved_path(e), c *= d, q = f = 0) : (r = (f === g ? -1 : 1) * sqrt$$module$runner$path$curved_path(e), f = r * c * q / d, q = -r * d * p / c);
    p = f * k - q * i + (a + h) / 2;
    k = f * i + q * k + (b + j) / 2;
    b = asin$$module$runner$path$curved_path((b - k) / d);
    j = asin$$module$runner$path$curved_path((j - k) / d);
    b = a < p ? PI$$module$runner$path$curved_path - b : b;
    j = h < p ? PI$$module$runner$path$curved_path - j : j;
    0 > b && (b = 2 * PI$$module$runner$path$curved_path + b);
    0 > j && (j = 2 * PI$$module$runner$path$curved_path + j);
    g && b > j && (b -= 2 * PI$$module$runner$path$curved_path);
    !g && j > b && (j -= 2 * PI$$module$runner$path$curved_path);
    return{cx:p, cy:k, rx:c, ry:d, startAngle:b, endAngle:j}
  }
  CurvedPath$$module$runner$path$curved_path.splitAbsoluteCubicBezier = splitAbsoluteCubicBezier$$module$runner$path$curved_path;
  function splitAbsoluteCubicBezier$$module$runner$path$curved_path(a, b, c, d, e) {
    if(0 == e) {
      return{left:[a, a, a, a], right:[a, b, c, d]}
    }
    if(1 == e) {
      return{left:[a, b, c, d], right:[d, d, d, d]}
    }
    var f = Point$$module$runner$path$curved_path.lerp(a, b, e), g = Point$$module$runner$path$curved_path.lerp(b, c, e), c = Point$$module$runner$path$curved_path.lerp(c, d, e), b = Point$$module$runner$path$curved_path.lerp(f, g, e), g = Point$$module$runner$path$curved_path.lerp(g, c, e), e = Point$$module$runner$path$curved_path.lerp(b, g, e);
    return{left:[a, f, b, e], right:[e, g, c, d]}
  }
  CurvedPath$$module$runner$path$curved_path.countSubPaths = function(a) {
    for(var b = [], c = 0, d = 0, e = a.length;d < e;++d) {
      "closePath" === a[d][0] || d === e - 1 ? (b.push(c + 1), c = 0) : ++c
    }
    return b
  };
  CurvedPath$$module$runner$path$curved_path.subPathToCurves = function(a, b) {
    var c = new CurvedPath$$module$runner$path$curved_path, d = c._segments, e, f, g, h = !1;
    if(!a) {
      return[]
    }
    !a.length && b && (a = [["moveTo", 0, 0], ["closePath"]]);
    e = 0;
    for(h = a.length;e < h;++e) {
      f = a[e], (g = f[0]) && c[g].apply(c, f.slice(1))
    }
    h = (e = d.length) && "closePath" === d[e - 1][0];
    if(e < b) {
      b -= e;
      h && e--;
      g = Math.ceil(e / b);
      f = Math.ceil(1 / (e / b));
      e -= 1;
      a:for(;0 <= e;e -= g) {
        for(var j = f;j--;) {
          if(b--) {
            c.nullCurve(e)
          }else {
            break a
          }
        }
      }
      for(e = d.length;0 < b--;) {
        c.nullCurve(h ? e - 2 : e - 1)
      }
    }
    return d
  };
  CurvedPath$$module$runner$path$curved_path.toCurves = function(a, b) {
    if(!tools$$module$runner$path$curved_path.isArray(a)) {
      return[]
    }
    tools$$module$runner$path$curved_path.isArray(b) || (b = [b]);
    for(var c = CurvedPath$$module$runner$path$curved_path.countSubPaths(a), d = [], e = 0, f = Math.max(c.length, b.length);e < f;++e) {
      d = d.concat(CurvedPath$$module$runner$path$curved_path.subPathToCurves(a.splice(0, c[e]), b[e]))
    }
    return d
  };
  CurvedPath$$module$runner$path$curved_path.fromArc = function(a, b, c, d, e, f, g, h, j) {
    if(!(a === h && b === j)) {
      if(0 === c || 0 === d) {
        return["lineTo", x, y]
      }
      abs$$module$runner$path$curved_path(c);
      abs$$module$runner$path$curved_path(d)
    }
  };
  module$runner$path$curved_path.module$exports = CurvedPath$$module$runner$path$curved_path;
  module$runner$path$curved_path.module$exports && (module$runner$path$curved_path = module$runner$path$curved_path.module$exports);
  var module$runner$timeline = {}, EventEmitter$$module$runner$timeline = module$event_emitter, tools$$module$runner$timeline = module$tools, round$$module$runner$timeline = Math.round, Timeline$$module$runner$timeline = {currentFrame:0, isPlaying:!0, incrementFrame:function() {
    this.isPlaying && (this.currentFrame = (this.currentFrame + 1) % (null == this._length ? Infinity : this._length) || 0)
  }, emitFrame:function() {
    var a = this.currentFrame, b = this.skipFrame;
    this.emit("tick", this, a);
    if(this.isPlaying) {
      if(null == this.skipFrame || this.skipFrame != a) {
        this.emit("" + a, this, a), this.emit("advance", this, a)
      }
      this.skipFrame === b && (this.skipFrame = null)
    }
  }, frames:function(a) {
    var b, c, d = 0;
    for(c in a) {
      b = this.toFrameNumber(c), b > d && (d = b), this.on(b, a[c])
    }
    d > this.length() && (this._length = d + 1);
    return this
  }, length:function(a) {
    var b = this._length || (this._length = 0);
    if(!arguments.length) {
      return b
    }
    for(a *= 1;b-- >= a;) {
      this.removeAllListeners(b)
    }
    this._length = a;
    return this
  }, play:function(a) {
    a *= 1;
    this.isPlaying = !0;
    0 <= a && (this.currentFrame = a, this.emit(a + "", this, a), this.skipFrame = a);
    return this
  }, stop:function(a) {
    a *= 1;
    this.isPlaying = !1;
    0 <= a && a < this.length() && (this.currentFrame = a, this.emit(a + "", this, a), this.skipFrame = a);
    return this
  }, toFrameNumber:function(a) {
    if(a == +a) {
      return+a
    }
    if("from" == a || "start" == a) {
      return 0
    }
    if("to" == a || "end" == a) {
      return this._length
    }
    a = /^([\d.]+)(\D+)$/.exec(a) || [];
    switch(a[2]) {
      case "ms":
        a[1] /= 1E3;
      case "s":
        return round$$module$runner$timeline(a[1] * (this.framerate || this.root.framerate));
      case "%":
        return round$$module$runner$timeline(this._length * a[1] / 100) || 0;
      default:
        throw Error("Unknown frame format: " + a[2]);
    }
  }};
  module$runner$timeline.module$exports = tools$$module$runner$timeline.mixin(Timeline$$module$runner$timeline, EventEmitter$$module$runner$timeline);
  module$runner$timeline.module$exports && (module$runner$timeline = module$runner$timeline.module$exports);
  var module$runner$animation$animation = {}, easing$$module$runner$animation$animation = module$runner$animation$easing, Timeline$$module$runner$animation$animation = module$runner$timeline, tools$$module$runner$animation$animation = module$tools, EventEmitter$$module$runner$animation$animation = module$event_emitter, color$$module$runner$animation$animation = module$color, colorTranslations$$module$runner$animation$animation = module$runner$animation$color_translations, gradientTranslations$$module$runner$animation$animation = 
  module$runner$animation$gradient_translations, filterTranslations$$module$runner$animation$animation = module$runner$animation$filter_translations, segmentTranslations$$module$runner$animation$animation = module$runner$animation$segment_translations, matrixTranslations$$module$runner$animation$animation = module$runner$animation$matrix_translations, cornerRadiusTranslations$$module$runner$animation$animation = module$runner$animation$corner_radius_translations, mixin$$module$runner$animation$animation = 
  tools$$module$runner$animation$animation.mixin, isArray$$module$runner$animation$animation = tools$$module$runner$animation$animation.isArray, forEach$$module$runner$animation$animation = tools$$module$runner$animation$animation.forEach, propertyTranslations$$module$runner$animation$animation = Animation$$module$runner$animation$animation.propertyTranslations = {};
  mixin$$module$runner$animation$animation(propertyTranslations$$module$runner$animation$animation, colorTranslations$$module$runner$animation$animation);
  mixin$$module$runner$animation$animation(propertyTranslations$$module$runner$animation$animation, gradientTranslations$$module$runner$animation$animation);
  mixin$$module$runner$animation$animation(propertyTranslations$$module$runner$animation$animation, filterTranslations$$module$runner$animation$animation);
  mixin$$module$runner$animation$animation(propertyTranslations$$module$runner$animation$animation, segmentTranslations$$module$runner$animation$animation);
  mixin$$module$runner$animation$animation(propertyTranslations$$module$runner$animation$animation, matrixTranslations$$module$runner$animation$animation);
  mixin$$module$runner$animation$animation(propertyTranslations$$module$runner$animation$animation, cornerRadiusTranslations$$module$runner$animation$animation);
  function Animation$$module$runner$animation$animation(a, b, c, d) {
    if(b instanceof Animation$$module$runner$animation$animation) {
      return b.clone()
    }
    this.subjectsById = {};
    this.subjects = [];
    d = this.options = d || {};
    this.isTimelineBound = !1 !== d.isTimelineBound;
    this._parseEventProps(d);
    var e = d.easing;
    this.easing = "function" == typeof e ? e : easing$$module$runner$animation$animation[e];
    this.clock = a;
    this.duration = Math.floor(+b || a.toFrameNumber(b));
    this.repeat = (d.repeat || 0) - (d.repeat % 1 || 0);
    this.delay = d.delay && a.toFrameNumber(d.delay) || 0;
    this.properties = c = tools$$module$runner$animation$animation.mixin({}, c);
    this._cleanProperties();
    this.propertyNames = Object.keys(c);
    this.translations = d.translate ? [d.translate] : [];
    this._translationData = {};
    this._getTranslations();
    this._runTranslations(c, "setupTo");
    this.propertyNames = Object.keys(c);
    this.strategy = d.strategy;
    this._bind()
  }
  Animation$$module$runner$animation$animation.prototype = {_cleanProperties:function() {
    var a = this.properties, b;
    for(b in a) {
      isNaN(a[b]) && (!a[b] || !(b in propertyTranslations$$module$runner$animation$animation)) && delete a[b]
    }
  }, _bind:function() {
    var a = this, b = this.delay, c = this.options;
    this.frame = 0;
    var d;
    this.onStep = function(c, f, g) {
      if(!(0 < b && b--)) {
        d = d || f;
        var c = a.duration, h = a.frame = a.isTimelineBound ? a.frame + (f - d || 1) : a.frame + 1;
        a.step(h / c);
        a.isTimelineBound && g || h === c ? (d = 0, b = a.delay, a.reset(), 0 < a.repeat-- ? a.play() : a.emit("end", a)) : d = f
      }
    };
    c.subjects && this.setSubjects(c.subjects, c.strategy)
  }, _getTranslations:function() {
    for(var a = this.propertyNames, b, c = 0, d = a.length;c < d;c++) {
      if(a[c] in propertyTranslations$$module$runner$animation$animation) {
        b = propertyTranslations$$module$runner$animation$animation[a[c]];
        if(!("function" == typeof b.step && "function" == typeof b.setupFrom && "function" == typeof b.setupTo || "function" == typeof b.setup)) {
          throw Error("Translation does not implement setup (or setupFrom & setupTo) and step methods.");
        }
        this.translations.push({methods:b, data:this._translationData[a[c]] = {}})
      }
    }
  }, _runTranslations:function(a, b) {
    for(var c, d, e = this.translations.length;e--;) {
      c = this.translations[e], d = "setupFrom" === b || "setupTo" === b ? c.methods[b] || c.methods.setup : c.methods[b], d.call(c.data, a)
    }
  }, play:function() {
    if(!this.subjects) {
      throw Error("Unspecified subjects.");
    }
    if(this.isPlaying) {
      return this
    }
    this.clock.on(this.isTimelineBound ? "advance" : "tick", this.onStep);
    0 === this.frame && this.emit("beforebegin", this);
    this.emit("play", this);
    this.isPlaying = !0;
    return this
  }, pause:function() {
    this.clock.removeListener(this.isTimelineBound ? "advance" : "tick", this.onStep);
    this.emit("pause", this);
    this.isPlaying = !1
  }, clone:function() {
    var a = {clock:this.clock, duration:this.duration, easing:this.easing, isTimelineBound:this.isTimelineBound};
    return new Animation$$module$runner$animation$animation(this.clock, this.duration, mixin$$module$runner$animation$animation({}, this.properties), a)
  }, _parseEventProps:function(a) {
    var b, c;
    for(b in a) {
      "function" === typeof a[b] && 0 === b.indexOf("on") && (c = b.slice(2).toLowerCase(), this.on(c, a[b]), delete a[b])
    }
  }, reset:function() {
    this.frame = 0;
    this.isPlaying = !1;
    this.clock.removeListener(this.isTimelineBound ? "advance" : "tick", this.onStep);
    return this
  }, addSubject:function(a, b) {
    var c = this.propertyNames, d, b = b || this.strategy || "attr";
    switch(b) {
      case "attr":
        d = a.attr();
        break;
      case "prop":
        d = {};
        for(var e = 0, f;f = c[e++];) {
          d[f] = a[f]
        }
        break;
      default:
        d = b.get(a, this.propertyNames)
    }
    this._runTranslations(d, "setupFrom");
    a.id in this.subjectsById || (this.subjectsById[a.id] = !0, this.subjects.push({subject:a, strategy:b, values:d}));
    return this
  }, addSubjects:function(a, b) {
    a = isArray$$module$runner$animation$animation(a) ? a : [a];
    forEach$$module$runner$animation$animation(a, function(a) {
      this.addSubject(a, b)
    }, this);
    return this
  }, removeSubject:function(a) {
    if(a.id in this.subjectsById) {
      for(var b = 0, c = this.subjects.length;b < c;++b) {
        if(this.subjects[b].subject === a) {
          this.subjects.splice(b, 1);
          break
        }
      }
      delete this.subjectsById[a.id]
    }
  }, removeSubjects:function(a) {
    forEach$$module$runner$animation$animation(a, function(a) {
      this.removeSubject(a)
    }, this);
    return this
  }, step:function(a) {
    var b, c, d, e, f, g, h, j = !!this.translations.length;
    b = this.easing;
    var i = this.properties, k = this.propertyNames, l = k.length, m = this.subjects, n = {};
    b && (a = b(a));
    for(var o = 0, p = m.length;o < p;++o) {
      e = m[o].values;
      c = m[o].subject;
      b = m[o].strategy;
      h = "attr" === b;
      for(var q = c._attributes, r = c._mutatedAttributes, s = 0;s < l;++s) {
        f = k[s], d = e[f], g = i[f], !j && h ? (q[f] = d + (g - d) * a, r[f] = !0) : n[f] = d + (g - d) * a
      }
      if(!j && h) {
        c.markUpdate()
      }else {
        if(this._runTranslations(n, "step"), "attr" === b) {
          c.attr(n)
        }else {
          if("prop" === b) {
            for(f in n) {
              c[f] = n[f]
            }
          }else {
            b.set(c, n)
          }
        }
      }
    }
    return this
  }};
  mixin$$module$runner$animation$animation(Animation$$module$runner$animation$animation.prototype, EventEmitter$$module$runner$animation$animation);
  module$runner$animation$animation.module$exports = Animation$$module$runner$animation$animation;
  module$runner$animation$animation.module$exports && (module$runner$animation$animation = module$runner$animation$animation.module$exports);
  var module$runner$animation$keyframe_animation = {}, Animation$$module$runner$animation$keyframe_animation = module$runner$animation$animation, easing$$module$runner$animation$keyframe_animation = module$runner$animation$easing, tools$$module$runner$animation$keyframe_animation = module$tools, EventEmitter$$module$runner$animation$keyframe_animation = module$event_emitter, max$$module$runner$animation$keyframe_animation = Math.max, round$$module$runner$animation$keyframe_animation = Math.round, 
  hasOwn$$module$runner$animation$keyframe_animation = {}.hasOwnProperty;
  function KeyframeAnimation$$module$runner$animation$keyframe_animation(a, b, c, d) {
    d || (d = {});
    this.clock = a;
    b = this.duration = +b || a.toFrameNumber(b);
    this.subjects = [];
    this.animations = [];
    this.initialValues = null;
    this.currentAnimation = -1;
    this.repeat = d.repeat || 0;
    this.easing = d.easing;
    this.keyframes = this._convertKeysToFrames(c);
    this.keys = Object.keys(this.keyframes).map(Number);
    this.keys.sort(function(a, b) {
      return a - b
    });
    d.subjects && this.setSubjects(d.subjects, d.strategy)
  }
  KeyframeAnimation$$module$runner$animation$keyframe_animation.prototype = {play:function(a, b) {
    a && this.setSubjects(a, b);
    if(0 > this.currentAnimation) {
      this.begin()
    }else {
      return this.animations[this.currentAnimation].isPlaying = !0, this
    }
  }, pause:function() {
    -1 < this.currentAnimation && (this.animations[this.currentAnimation].isPlaying = !1);
    return this
  }, reset:function() {
    this.animations.forEach(function(a) {
      a.reset()
    });
    this.currentAnimation = -1;
    return this
  }, begin:function() {
    var a = this.keyframes[0], b = this.subjects, c, d;
    if(a && b.length) {
      for(var e = 0, f = b.length;e < f;++e) {
        switch(d = b[e], c = d.strategy, d = d.subject, c) {
          case "attr":
            d.attr(a);
            break;
          case "prop":
            for(var g in a) {
              d[g] = a[g]
            }
            break;
          default:
            c.set(d, a)
        }
      }
    }
    this.currentAnimation = 0;
    this.subjects.forEach(function(a) {
      this.animations[0].addSubject(a.subject, a.strategy)
    }, this);
    this.animations[0].play();
    return this
  }, addSubject:function(a, b) {
    b = b || this.strategy || "attr";
    if(null == this.initialValues) {
      switch(b) {
        case "attr":
          this.initialValues = a.attr();
          break;
        case "prop":
          var c = Object.keys(a);
          this.initialValues = {};
          for(var d = 0, e;e = c[d++];) {
            this.initialValues[e] = a[e]
          }
          break;
        default:
          this.initialValues = b.get(a, this.propertyNames)
      }
    }
    this.subjects.push({subject:a, strategy:b});
    if(this.animations.length) {
      c = 0;
      for(d = this.animations.length;c < d;++c) {
        this.animations[c].addSubject(a, b)
      }
    }else {
      this._fillInProperties(), this._createAnimations()
    }
    return this
  }, addSubjects:function(a, b) {
    var c = this, a = tools$$module$runner$animation$keyframe_animation.isArray(a) ? a : [a];
    a.forEach(function(a) {
      c.addSubject(a, b)
    });
    return this
  }, removeSubject:function(a) {
    for(var b = 0, c = this.subjects.length;b < c;++b) {
      if(this.subjects[b].subject === a) {
        this.subjects.splice(b, 1);
        for(var d = 0, e = this.animations.length;d < e;++d) {
          this.animations[d].removeSubject(a)
        }
      }
    }
  }, removeSubjects:function(a) {
    a.forEach(tools$$module$runner$animation$keyframe_animation.hitch(this, "removeSubject"));
    return this
  }, setSubjects:function(a, b) {
    a = tools$$module$runner$animation$keyframe_animation.isArray(a) ? a : [a];
    this.removeSubjects(this.subjects.map(function(a) {
      return a.subject
    }));
    this.addSubjects(a, b);
    return this
  }, setSubject:function(a, b) {
    this.removeSubjects(this.subjects.map(function(a) {
      return a.subject
    }));
    this.addSubject(a, b);
    return this
  }, _createAnimations:function() {
    var a, b = 0, c, d = this.animations, e = this.keyframes;
    this.keys.forEach(function(f, g) {
      var h;
      if(0 !== f) {
        a = f - b;
        b += a;
        h = new Animation$$module$runner$animation$keyframe_animation(this.clock, a, e[f], {easing:this.easing, strategy:this.strategy});
        if(c) {
          c.on("end", this, function() {
            this.currentAnimation++;
            this.subjects.forEach(function(a) {
              h.addSubject(a.subject, a.strategy)
            }, this);
            h.play()
          })
        }
        d.push(h);
        c = h;
        if(g == this.keys.length - 1) {
          h.on("end", this, function() {
            Infinity === this.repeat || 0 < --this.repeat ? (this.reset(), this.play()) : this.emit("end", this)
          })
        }
      }
    }, this)
  }, _fillInProperties:function() {
    var a = this.initialValues, b = this.duration, c = this.keys, d = this.keyframes, e, f = {};
    c.forEach(function(a) {
      e = d[a];
      for(var b in e) {
        e.hasOwnProperty(b) && (f[b] = !0)
      }
    });
    c.forEach(function(g, h) {
      var j, i, k, l, m;
      e = d[g];
      for(m in f) {
        if(!hasOwn$$module$runner$animation$keyframe_animation.call(e, m)) {
          a: {
            j = m;
            for(i = h;i--;) {
              if(hasOwn$$module$runner$animation$keyframe_animation.call(d[c[i]], j)) {
                j = c[i];
                break a
              }
            }
            j = null
          }
          a: {
            i = m;
            k = h;
            for(l = c.length;k < l;++k) {
              if(hasOwn$$module$runner$animation$keyframe_animation.call(d[c[k]], i)) {
                i = c[k];
                break a
              }
            }
            i = null
          }
          k = j && d[j][m] || a[m];
          l = i && d[i][m];
          if(null == k) {
            throw Error("No initial value specified for property: " + m);
          }
          null == l && (l = k, i = b);
          e[m] = l * (g - j) / (i - j)
        }
      }
    })
  }, _convertKeysToFrames:function(a) {
    for(var b, c, d = 0, e = this.clock, f = this.duration, g = Object.keys(a), h = Object.create(null), j = 0, i = g.length;j < i;j++) {
      b = g[j], c = b == +b ? b : /^(?:from|start)$/.test(b) ? 0 : /^(?:to|end)$/.test(b) ? f : /^\d+%$/.test(b) ? f * parseFloat(b) / 100 : e.toFrameNumber(b), h[c] = a[b], c > d && (d = c)
    }
    d > this.duration && (this.duration = d);
    return h
  }};
  tools$$module$runner$animation$keyframe_animation.mixin(KeyframeAnimation$$module$runner$animation$keyframe_animation.prototype, EventEmitter$$module$runner$animation$keyframe_animation);
  module$runner$animation$keyframe_animation.module$exports = KeyframeAnimation$$module$runner$animation$keyframe_animation;
  module$runner$animation$keyframe_animation.module$exports && (module$runner$animation$keyframe_animation = module$runner$animation$keyframe_animation.module$exports);
  var module$runner$display_object = {}, EventEmitter$$module$runner$display_object = module$event_emitter, tools$$module$runner$display_object = module$tools, Matrix$$module$runner$display_object = module$runner$matrix, Point$$module$runner$display_object = module$point, Animation$$module$runner$display_object = module$runner$animation$animation, KeyframeAnimation$$module$runner$display_object = module$runner$animation$keyframe_animation, filter$$module$runner$display_object = module$runner$filter$builtin, 
  accessor$$module$runner$display_object = tools$$module$runner$display_object.descriptorAccessor, data$$module$runner$display_object = tools$$module$runner$display_object.descriptorData, getter$$module$runner$display_object = tools$$module$runner$display_object.getter, uid$$module$runner$display_object = 1, atan2$$module$runner$display_object = Math.atan2, PI$$module$runner$display_object = Math.PI, isfinite$$module$runner$display_object = isFinite;
  function getRotation$$module$runner$display_object() {
    var a = this._matrix, b = atan2$$module$runner$display_object(a.b, a.a), a = -atan2$$module$runner$display_object(a.c, a.d);
    return b > a ? b : a
  }
  function setRotation$$module$runner$display_object(a) {
    if(isfinite$$module$runner$display_object(a)) {
      var a = +a % (2 * PI$$module$runner$display_object) || 0, b = this._matrix, c = b.transformPoint(this.origin), d = c.x, c = c.y;
      b.tx -= d;
      b.ty -= c;
      b.rotate(a - this.rotation);
      b.tx += d;
      b.ty += c;
      this._owner._mutatedAttributes.matrix = !0
    }
  }
  function getMatrix$$module$runner$display_object() {
    var a, b = this._matrix.clone(), c = this._scaleX, d = this._scaleY;
    if(1 !== c || 1 !== d) {
      a = b.transformPoint(this._origin), b.tx -= a.x, b.ty -= a.y, b.scale(c, d), b.tx += a.x, b.ty += a.y
    }
    return b
  }
  function setMatrix$$module$runner$display_object(a) {
    var b = this._matrix;
    b.a = a.a;
    b.b = a.b;
    b.c = a.c;
    b.d = a.d;
    b.tx = a.tx;
    b.ty = a.ty
  }
  function getX$$module$runner$display_object() {
    return this.matrix.tx
  }
  function setX$$module$runner$display_object(a) {
    this._matrix.tx = 1 === this._scaleX ? a : this._matrix.tx + (a - this.matrix.tx);
    this._owner._mutatedAttributes.matrix = !0
  }
  function getY$$module$runner$display_object() {
    return this.matrix.ty
  }
  function setY$$module$runner$display_object(a) {
    this._matrix.ty = 1 === this._scaleY ? a : this._matrix.ty + (a - this.matrix.ty);
    this._owner._mutatedAttributes.matrix = !0
  }
  function getScaleX$$module$runner$display_object() {
    return this._scaleX
  }
  function setScaleX$$module$runner$display_object(a) {
    isfinite$$module$runner$display_object(a) && (this._scaleX = +a, this._owner._mutatedAttributes.matrix = !0)
  }
  function getScaleY$$module$runner$display_object() {
    return this._scaleY
  }
  function setScaleY$$module$runner$display_object(a) {
    isfinite$$module$runner$display_object(a) && (this._scaleY = +a, this._owner._mutatedAttributes.matrix = !0)
  }
  function getScale$$module$runner$display_object() {
    return(this.scaleX + this.scaleY) / 2
  }
  function setScale$$module$runner$display_object(a) {
    this.scaleX = this.scaleY = a
  }
  var getOpacity$$module$runner$display_object = getter$$module$runner$display_object("_opacity");
  function setOpacity$$module$runner$display_object(a) {
    this._opacity = 1 < a ? 1 : 0 > a ? 0 : +a
  }
  function getOrigin$$module$runner$display_object() {
    return this._origin.clone()
  }
  function setOrigin$$module$runner$display_object(a) {
    var b = this._origin;
    b.x = a.x;
    b.y = a.y
  }
  function getCursor$$module$runner$display_object() {
    return this._cursor
  }
  function setCursor$$module$runner$display_object(a) {
    a ? /^(?:default|pointer|wait|progress)$/.test(a) && (this._cursor = a) : this._cursor = null
  }
  function getFilters$$module$runner$display_object() {
    return this._filters.slice(0)
  }
  function setFilters$$module$runner$display_object(a) {
    a ? (a = [].concat(a), this._filters = a = a.map(function(a) {
      return a instanceof filter$$module$runner$display_object.BaseFilter ? a : new filter$$module$runner$display_object[a]
    })) : this._filters.length = 0
  }
  function setClip$$module$runner$display_object(a) {
    var b = this._owner;
    b._mutatedAttributes.clipId = !0;
    if(a) {
      if(a.stage && !a._isOffStage) {
        throw Error("You cannot set a clip that has been previously added to the stage");
      }
      if(!("composeRenderMessage" in a)) {
        throw Error("Not a valid clip element");
      }
      b.stage && DisplayObject$$module$runner$display_object.registerOffStageObj(b, a, b.stage, "clip");
      this._clipId = a.id;
      this._clip = a
    }else {
      this._clip && DisplayObject$$module$runner$display_object.unregisterOffStageObj(b, this._clip), this._clipId = this._clip = null
    }
  }
  function getClip$$module$runner$display_object() {
    return this._clip
  }
  function setMask$$module$runner$display_object(a) {
    var b = this._owner;
    b._mutatedAttributes.maskId = !0;
    if(a) {
      if(a.stage && !a._isOffStage) {
        throw Error("You cannot set a mask that has been previously added to the stage");
      }
      if(!("composeRenderMessage" in a)) {
        throw Error("Not a valid mask");
      }
      b.stage && DisplayObject$$module$runner$display_object.registerOffStageObj(b, a, b.stage, "mask");
      this._maskId = a.id;
      this._mask = a
    }else {
      this._mask && DisplayObject$$module$runner$display_object.unregisterOffStageObj(b, this._mask), this._maskId = this._mask = null
    }
  }
  function getMask$$module$runner$display_object() {
    return this._mask
  }
  function DisplayObject$$module$runner$display_object() {
    Object.defineProperty(this, "id", {value:uid$$module$runner$display_object++});
    this._attributes = Object.create(null, {_owner:data$$module$runner$display_object(this), _matrix:data$$module$runner$display_object(new Matrix$$module$runner$display_object), matrix:accessor$$module$runner$display_object(getMatrix$$module$runner$display_object, setMatrix$$module$runner$display_object, !0), _filters:data$$module$runner$display_object([], !0), filters:accessor$$module$runner$display_object(getFilters$$module$runner$display_object, setFilters$$module$runner$display_object, !0), 
    _opacity:data$$module$runner$display_object(1, !0), opacity:accessor$$module$runner$display_object(getOpacity$$module$runner$display_object, setOpacity$$module$runner$display_object, !0), _origin:data$$module$runner$display_object(new Point$$module$runner$display_object), origin:accessor$$module$runner$display_object(getOrigin$$module$runner$display_object, setOrigin$$module$runner$display_object, !0), rotation:accessor$$module$runner$display_object(getRotation$$module$runner$display_object, 
    setRotation$$module$runner$display_object, !0), _scaleX:data$$module$runner$display_object(1, !0), _scaleY:data$$module$runner$display_object(1, !0), scale:accessor$$module$runner$display_object(getScale$$module$runner$display_object, setScale$$module$runner$display_object, !0), scaleX:accessor$$module$runner$display_object(getScaleX$$module$runner$display_object, setScaleX$$module$runner$display_object, !0), scaleY:accessor$$module$runner$display_object(getScaleY$$module$runner$display_object, 
    setScaleY$$module$runner$display_object, !0), x:accessor$$module$runner$display_object(getX$$module$runner$display_object, setX$$module$runner$display_object, !0), y:accessor$$module$runner$display_object(getY$$module$runner$display_object, setY$$module$runner$display_object, !0), clip:accessor$$module$runner$display_object(getClip$$module$runner$display_object, setClip$$module$runner$display_object, !0), _clip:data$$module$runner$display_object(null, !0), _clipId:data$$module$runner$display_object(null, 
    !0), mask:accessor$$module$runner$display_object(getMask$$module$runner$display_object, setMask$$module$runner$display_object, !0), _mask:data$$module$runner$display_object(null, !0), _maskId:data$$module$runner$display_object(null, !0), cursor:accessor$$module$runner$display_object(getCursor$$module$runner$display_object, setCursor$$module$runner$display_object, !0), _cursor:data$$module$runner$display_object(null, !0), fillRule:data$$module$runner$display_object("inherit", !0), visible:data$$module$runner$display_object(!0, 
    !0)});
    this._isOffStage = !1;
    this._renderAttributes = {matrix:"matrix", filters:"_filters", opacity:"_opacity", clipId:"_clipId", maskId:"_maskId", cursor:"_cursor", fillRule:"fillRule", visible:"visible"};
    this._mutatedAttributes = tools$$module$runner$display_object.mixin({}, this._renderAttributes)
  }
  DisplayObject$$module$runner$display_object.registerOffStageObj = function(a, b, c, d, e) {
    if(c && (b.stage = c, b._offStageType = d, b._isOffStage = !0, c.registry.needsDraw[b.id] = b, c.registry.needsInsertion[b.id] = b, c.registry.displayObjects[b.id] = b, "Movie" === b.type && c.registry.movies.add(b), e || (b.parent = c, b._offStageUseCount = b._offStageUseCount ? b._offStageUseCount + 1 : 1, a.once("removedFromStage", function() {
      1 === b._offStageUseCount ? DisplayObject$$module$runner$display_object.unregisterOffStageObj(a, b, !0) : b._offStageUseCount--
    })), b._activate(c), b._children)) {
      for(var e = 0, f = b._children.length;e < f;++e) {
        var g = b._children[e];
        g && DisplayObject$$module$runner$display_object.registerOffStageObj(a, g, c, d, !0)
      }
    }
  };
  DisplayObject$$module$runner$display_object.unregisterOffStageObj = function(a, b, c) {
    if(!c) {
      if(0 < --b._offStageUseCount) {
        return
      }
      delete b._offStageUseCount
    }
    if(c = b.stage) {
      if(b.emit("removedFromStage"), c.registry.needsDraw[b.id] = b, delete c.registry.needsInsertion[b.id], delete c.registry.displayObjects[b.id], delete b.stage, b.markUpdate("shapeData"), delete b._offStageType, b._isOffStage = !1, b._children) {
        for(var c = 0, d = b._children.length;c < d;++c) {
          var e = b._children[c];
          e && DisplayObject$$module$runner$display_object.unregisterOffStageObj(a, e, !0)
        }
      }
    }
  };
  var proto$$module$runner$display_object = DisplayObject$$module$runner$display_object.prototype = {parent:null, type:"DisplayObject", _activate:function(a) {
    this.stage = a;
    this._mutatedAttributes = tools$$module$runner$display_object.mixin({}, this._renderAttributes);
    var b = this._attributes, c = b._clip;
    c && DisplayObject$$module$runner$display_object.registerOffStageObj(this, c, a, "clip");
    (b = b._mask) && DisplayObject$$module$runner$display_object.registerOffStageObj(this, b, a, "mask");
    this.parent._isOffStage && (this._offStageType = this.parent._offStageType, this._isOffStage = !0);
    this.emit("addedToStage")
  }, _deactivate:function() {
    delete this.stage;
    this.emit("removedFromStage")
  }, attr:function(a, b) {
    var c, d, e = this._attributes;
    switch(arguments.length) {
      case 0:
        c = {};
        for(d in e) {
          "_" != d.charAt(0) && (c[d] = e[d])
        }
        return c;
      case 1:
        if("string" == typeof a) {
          return a in e && "_" != a.charAt(0) ? e[a] : void 0
        }
        for(d in a) {
          d in e && "_" != d.charAt(0) && (e[d] = a[d], this._mutatedAttributes[d] = !0)
        }
        break;
      case 2:
        a in e && "_" != a.charAt(0) && (e[a] = b, this._mutatedAttributes[a] = !0)
    }
    this.markUpdate();
    return this
  }, getComputed:function(a) {
    var b = {top:0, right:0, bottom:0, left:0, width:0, height:0};
    return"size" === a ? b : b[a]
  }, destroy:function() {
    return this.removeAllListeners().remove()
  }, mask:function() {
  }, blendMode:function() {
  }, markUpdate:function() {
    var a = this.stage;
    a && (a.registry.needsDraw[this.id] = this);
    return this
  }, addTo:function(a, b) {
    a.addChild(this, b);
    return this
  }, addAfter:function(a) {
    var b = a.parent;
    b.addChild(this, b.getIndexOfChild(a) + 1);
    return this
  }, addBefore:function(a) {
    var b = a.parent;
    b.addChild(this, b.getIndexOfChild(a));
    return this
  }, remove:function(a) {
    var b = this.parent;
    b && b.removeChild(this, a);
    return this
  }, setOrigin:function(a, b) {
    return this.attr("origin", {x:a, y:b})
  }, composeRenderMessage:function(a) {
    a || (a = {attributes:{}, id:this.id});
    var b = a.attributes || {}, c = this._mutatedAttributes, d = this._renderAttributes, e = this._attributes, f;
    for(f in c) {
      f in d && (b[f] = e[d[f]])
    }
    this._mutatedAttributes = {};
    a.attributes = b;
    a.data = this._getRenderData && this._getRenderData();
    a.type = this.type;
    a.offStageType = this._offStageType;
    return a
  }, animate:function(a, b, c) {
    var d = a;
    if(!(d instanceof Animation$$module$runner$display_object || d instanceof KeyframeAnimation$$module$runner$display_object)) {
      d = c && c.clock || this.stage;
      c || (c = {});
      if(!d) {
        for(d = this;d && !d.emitFrame;) {
          d = d.parent
        }
      }
      if(!d) {
        return this.once("addedToStage", function() {
          this.animate(a, b, c)
        }), this
      }
      d = new Animation$$module$runner$display_object(d, a, b, c)
    }
    d.addSubject(this).play();
    return this
  }};
  tools$$module$runner$display_object.mixin(proto$$module$runner$display_object, EventEmitter$$module$runner$display_object);
  module$runner$display_object.module$exports = DisplayObject$$module$runner$display_object;
  module$runner$display_object.module$exports && (module$runner$display_object = module$runner$display_object.module$exports);
  var module$runner$group = {}, DisplayObject$$module$runner$group = module$runner$display_object, DisplayList$$module$runner$group = module$runner$display_list, tools$$module$runner$group = module$tools;
  function Group$$module$runner$group() {
    DisplayObject$$module$runner$group.call(this)
  }
  var proto$$module$runner$group = Group$$module$runner$group.prototype = Object.create(DisplayObject$$module$runner$group.prototype);
  tools$$module$runner$group.mixin(proto$$module$runner$group, DisplayList$$module$runner$group);
  proto$$module$runner$group.type = "Group";
  proto$$module$runner$group.clone = function(a) {
    var b = new Group$$module$runner$group;
    a.attributes && b.attr(this.attr());
    this.children().forEach(function(c) {
      c.clone && b.addChild(c.clone(a))
    }, this);
    return b
  };
  module$runner$group.module$exports = Group$$module$runner$group;
  module$runner$group.module$exports && (module$runner$group = module$runner$group.module$exports);
  var module$runner$dom_element = {}, Group$$module$runner$dom_element = module$runner$group, tools$$module$runner$dom_element = module$tools, CSS_PREFIX$$module$runner$dom_element = "css_", DOM_PREFIX$$module$runner$dom_element = "dom_";
  function DOMElement$$module$runner$dom_element(a, b, c) {
    Group$$module$runner$dom_element.call(this);
    this.nodeName = a || "";
    this._domAttributes = {};
    this._cssStyles = {};
    this._mutatedDomAttributes = {};
    this._mutatedCssStyles = {};
    this.type = "DOMElement";
    this.setStyles(c);
    this.setAttributes(b);
    this.on("removedFromStage", function() {
      this._mutatedDomAttributes = tools$$module$runner$dom_element.mixin({}, this._domAttributes);
      this._mutatedCssStyles = tools$$module$runner$dom_element.mixin({}, this._cssStyles)
    })
  }
  var proto$$module$runner$dom_element = DOMElement$$module$runner$dom_element.prototype = Object.create(Group$$module$runner$dom_element.prototype);
  proto$$module$runner$dom_element.getAttribute = function(a) {
    return this._domAttributes[a]
  };
  proto$$module$runner$dom_element.getStyle = function(a) {
    return this._cssStyles[a]
  };
  proto$$module$runner$dom_element.setAttribute = function(a, b) {
    this._domAttributes[a] = b;
    this._mutatedDomAttributes[a] = !0;
    this.markUpdate();
    return this
  };
  proto$$module$runner$dom_element.setAttributes = function(a) {
    for(var b in a) {
      this.setAttribute(b, a[b])
    }
    return this
  };
  proto$$module$runner$dom_element.setStyles = function(a) {
    for(var b in a) {
      this.setStyle(b, a[b])
    }
    return this
  };
  proto$$module$runner$dom_element.setStyle = function(a, b) {
    this._cssStyles[a] = b;
    this._mutatedCssStyles[a] = !0;
    this.markUpdate();
    return this
  };
  proto$$module$runner$dom_element.composeRenderMessage = function(a) {
    var a = Group$$module$runner$dom_element.prototype.composeRenderMessage.call(this, a), b, a = a.attributes, c = this._cssStyles, d = this._domAttributes, e = this._mutatedDomAttributes, f = this._mutatedCssStyles;
    a.nodeName = this.nodeName;
    for(b in e) {
      a[DOM_PREFIX$$module$runner$dom_element + b] = d[b]
    }
    for(b in f) {
      a[CSS_PREFIX$$module$runner$dom_element + b] = c[b]
    }
    this._mutatedCssStyles = {};
    this._mutatedDomAttributes = {};
    return{id:this.id, attributes:a, data:this._getRenderData && this._getRenderData(), type:this.type, offStageType:this._offStageType}
  };
  module$runner$dom_element.module$exports = DOMElement$$module$runner$dom_element;
  module$runner$dom_element.module$exports && (module$runner$dom_element = module$runner$dom_element.module$exports);
  var module$runner$text_span = {}, DisplayObject$$module$runner$text_span = module$runner$display_object, color$$module$runner$text_span = module$color, gradient$$module$runner$text_span = module$runner$gradient, tools$$module$runner$text_span = module$tools, accessor$$module$runner$text_span = tools$$module$runner$text_span.descriptorAccessor, data$$module$runner$text_span = tools$$module$runner$text_span.descriptorData, getter$$module$runner$text_span = tools$$module$runner$text_span.getter, parseColor$$module$runner$text_span = 
  color$$module$runner$text_span.parse;
  function getTextFillColor$$module$runner$text_span() {
    return this._textFillColor
  }
  function setTextFillColor$$module$runner$text_span(a) {
    this._textFillColor = parseColor$$module$runner$text_span(a, this._textFillColor)
  }
  function getTextFillGradient$$module$runner$text_span() {
    return this._textFillGradient
  }
  function setTextFillGradient$$module$runner$text_span(a) {
    a && (this._textFillGradient = gradient$$module$runner$text_span(a))
  }
  function getFontFamily$$module$runner$text_span() {
    return this._fontFamily
  }
  function setFontFamily$$module$runner$text_span(a) {
    this._fontFamily = a ? a.fontId || a : null
  }
  function getGlyphx$$module$runner$text_span() {
    return this._glyphx
  }
  function setGlyphx$$module$runner$text_span(a) {
    tools$$module$runner$text_span.isArray(a) && (this._glyphx = a);
    a || (this._glyphx = null)
  }
  function getGlyphy$$module$runner$text_span() {
    return this._glyphy
  }
  function setGlyphy$$module$runner$text_span(a) {
    tools$$module$runner$text_span.isArray(a) && (this._glyphy = a);
    a || (this._glyphy = null)
  }
  var getTextStrokeColor$$module$runner$text_span = getter$$module$runner$text_span("_textStrokeColor");
  function setTextStrokeColor$$module$runner$text_span(a) {
    this._textStrokeColor = parseColor$$module$runner$text_span(a, this._textStrokeColor)
  }
  function TextSpan$$module$runner$text_span(a) {
    DisplayObject$$module$runner$text_span.call(this);
    Object.defineProperties(this._attributes, {text:data$$module$runner$text_span(a || "", !0, !0), fontSize:data$$module$runner$text_span(null, !0, !0), fontFamily:accessor$$module$runner$text_span(getFontFamily$$module$runner$text_span, setFontFamily$$module$runner$text_span, !0), _fontFamily:data$$module$runner$text_span(null, !0), fontStyle:data$$module$runner$text_span(null, !0, !0), fontWeight:data$$module$runner$text_span(null, !0, !0), _textFillColor:data$$module$runner$text_span(null, !0), 
    textFillColor:accessor$$module$runner$text_span(getTextFillColor$$module$runner$text_span, setTextFillColor$$module$runner$text_span, !0), _textFillGradient:data$$module$runner$text_span(null, !0), textFillGradient:accessor$$module$runner$text_span(getTextFillGradient$$module$runner$text_span, setTextFillGradient$$module$runner$text_span, !0), textFillOpacity:data$$module$runner$text_span(1, !0, !0), _glyphx:data$$module$runner$text_span(null, !0), _glyphy:data$$module$runner$text_span(null, 
    !0), glyphx:accessor$$module$runner$text_span(getGlyphx$$module$runner$text_span, setGlyphx$$module$runner$text_span, !0), glyphy:accessor$$module$runner$text_span(getGlyphy$$module$runner$text_span, setGlyphy$$module$runner$text_span, !0), textLineOpacity:data$$module$runner$text_span(1, !0, !0), _textStrokeColor:data$$module$runner$text_span(null, !0), textStrokeColor:accessor$$module$runner$text_span(getTextStrokeColor$$module$runner$text_span, setTextStrokeColor$$module$runner$text_span, 
    !0), textStrokeWidth:data$$module$runner$text_span(0, !0, !0), selectable:data$$module$runner$text_span(!0, !0, !0)});
    this._renderAttributes = {fontSize:"fontSize", fontFamily:"_fontFamily", fontStyle:"fontStyle", fontWeight:"fontWeight", fillColor:"_textFillColor", fillGradient:"_textFillGradient", fillOpacity:"textFillOpacity", filters:"_filters", glyphx:"_glyphx", glyphy:"_glyphy", strokeOpacity:"textLineOpacity", strokeColor:"_textStrokeColor", strokeWidth:"textStrokeWidth", opacity:"_opacity", text:"text", selectable:"selectable"};
    a && this.attr("text", a)
  }
  var proto$$module$runner$text_span = TextSpan$$module$runner$text_span.prototype = Object.create(DisplayObject$$module$runner$text_span.prototype);
  proto$$module$runner$text_span.type = "TextSpan";
  proto$$module$runner$text_span.setText = function(a) {
    return this.attr("text", a)
  };
  proto$$module$runner$text_span.getText = function() {
    return this.attr("text")
  };
  module$runner$text_span.module$exports = TextSpan$$module$runner$text_span;
  module$runner$text_span.module$exports && (module$runner$text_span = module$runner$text_span.module$exports);
  var module$runner$text = {}, Group$$module$runner$text = module$runner$group, TextSpan$$module$runner$text = module$runner$text_span, color$$module$runner$text = module$color, gradient$$module$runner$text = module$runner$gradient, tools$$module$runner$text = module$tools, accessor$$module$runner$text = tools$$module$runner$text.descriptorAccessor, data$$module$runner$text = tools$$module$runner$text.descriptorData, getter$$module$runner$text = tools$$module$runner$text.getter, parseColor$$module$runner$text = 
  color$$module$runner$text.parse;
  function getTextFillColor$$module$runner$text() {
    return this._textFillColor
  }
  function setTextFillColor$$module$runner$text(a) {
    this._textFillColor = parseColor$$module$runner$text(a, this._textFillColor)
  }
  function getTextFillGradient$$module$runner$text() {
    return this._textFillGradient
  }
  function setTextFillGradient$$module$runner$text(a) {
    a && (this._textFillGradient = gradient$$module$runner$text(a))
  }
  function getFontFamily$$module$runner$text() {
    return this._fontFamily
  }
  function setFontFamily$$module$runner$text(a) {
    this._fontFamily = a ? a.fontId || a : null
  }
  var getTextStrokeColor$$module$runner$text = getter$$module$runner$text("_textStrokeColor");
  function setTextStrokeColor$$module$runner$text(a) {
    this._textStrokeColor = parseColor$$module$runner$text(a, this._textStrokeColor)
  }
  var getCap$$module$runner$text = getter$$module$runner$text("_cap");
  function setCap$$module$runner$text(a) {
    if("butt" === a || "round" === a || "square" === a) {
      this._cap = "" + a
    }
  }
  var getJoin$$module$runner$text = getter$$module$runner$text("_join");
  function setJoin$$module$runner$text(a) {
    if("miter" === a || "round" === a || "bevel" === a) {
      this._join = "" + a
    }
  }
  var getMiterLimit$$module$runner$text = getter$$module$runner$text("_miterLimit");
  function setMiterLimit$$module$runner$text(a) {
    1 <= a && (this._miterLimit = +a)
  }
  function setText$$module$runner$text(a) {
    this._owner.clear();
    this._owner.addChild(new TextSpan$$module$runner$text(a))
  }
  function getText$$module$runner$text() {
    for(var a = this._owner.children(), b = [], c = 0, d = a.length;c < d;++c) {
      b.push(a[c].attr("text"))
    }
    return b.join("")
  }
  function Text$$module$runner$text(a) {
    Group$$module$runner$text.call(this);
    Object.defineProperties(this._attributes, {fontSize:data$$module$runner$text(16, !0, !0), fontFamily:accessor$$module$runner$text(getFontFamily$$module$runner$text, setFontFamily$$module$runner$text, !0), _fontFamily:data$$module$runner$text("monospace", !0), fontStyle:data$$module$runner$text("normal", !0, !0), fontWeight:data$$module$runner$text("normal", !0, !0), _cap:data$$module$runner$text("butt", !0), cap:accessor$$module$runner$text(getCap$$module$runner$text, setCap$$module$runner$text, 
    !0), _textFillColor:data$$module$runner$text(255, !0), textFillColor:accessor$$module$runner$text(getTextFillColor$$module$runner$text, setTextFillColor$$module$runner$text, !0), _textFillGradient:data$$module$runner$text(null, !0), textFillGradient:accessor$$module$runner$text(getTextFillGradient$$module$runner$text, setTextFillGradient$$module$runner$text, !0), textFillOpacity:data$$module$runner$text(1, !0, !0), textLineOpacity:data$$module$runner$text(1, !0, !0), _join:data$$module$runner$text("miter", 
    !0), join:accessor$$module$runner$text(getJoin$$module$runner$text, setJoin$$module$runner$text, !0), _textStrokeColor:data$$module$runner$text(255, !0), textStrokeColor:accessor$$module$runner$text(getTextStrokeColor$$module$runner$text, setTextStrokeColor$$module$runner$text, !0), textStrokeWidth:data$$module$runner$text(0, !0, !0), _miterLimit:data$$module$runner$text(4, !0), miterLimit:accessor$$module$runner$text(getMiterLimit$$module$runner$text, setMiterLimit$$module$runner$text, !0), 
    text:accessor$$module$runner$text(getText$$module$runner$text, setText$$module$runner$text, !0), textOrigin:data$$module$runner$text(null, !0, !0), selectable:data$$module$runner$text(!0, !0, !0)});
    var b = this._renderAttributes;
    b.fontSize = "fontSize";
    b.fontFamily = "_fontFamily";
    b.fontStyle = "fontStyle";
    b.fontWeight = "fontWeight";
    b.cap = "_cap";
    b.fillColor = "_textFillColor";
    b.strokeColor = "_textStrokeColor";
    b.fillGradient = "_textFillGradient";
    b.fillOpacity = "textFillOpacity";
    b.strokeOpacity = "textLineOpacity";
    b.join = "_join";
    b.strokeWidth = "textStrokeWidth";
    b.miterLimit = "_miterLimit";
    b.selectable = "selectable";
    b.textOrigin = "textOrigin";
    a && this.attr("text", a)
  }
  var superObject$$module$runner$text = Group$$module$runner$text.prototype, proto$$module$runner$text = Text$$module$runner$text.prototype = Object.create(superObject$$module$runner$text);
  proto$$module$runner$text.addChild = function(a, b) {
    if(!(tools$$module$runner$text.isArray(a) ? a.every(function(a) {
      return a instanceof TextSpan$$module$runner$text
    }) : a instanceof TextSpan$$module$runner$text)) {
      throw TypeError("child is not a TextSpan instance/an array of TextSpans");
    }
    return superObject$$module$runner$text.addChild.apply(this, arguments)
  };
  proto$$module$runner$text.type = "Text";
  proto$$module$runner$text.setText = function(a) {
    return this.attr("text", a)
  };
  proto$$module$runner$text.getText = function() {
    return this.attr("text")
  };
  module$runner$text.module$exports = Text$$module$runner$text;
  module$runner$text.module$exports && (module$runner$text = module$runner$text.module$exports);
  var module$uri = {};
  function URI$$module$uri(a, b, c, d, e) {
    this.scheme = a || void 0;
    this.authority = b || void 0;
    this.path = c || "";
    this.query = d || "";
    this.fragment = e || ""
  }
  function resolvePaths$$module$uri(a, b) {
    return"/" === b.charAt(0) ? b : a.replace(/[/]+[^/]*$/, "/") + b
  }
  URI$$module$uri.parse = function(a) {
    a = /^(?:([a-z][a-z0-9+.-]*):)?(?:\/\/([^/#?]*))?([^?#]*)(?:[?]([^#]*))?(?:#(.*))?/.exec(a);
    return!a ? a : new URI$$module$uri(a[1], a[2], a[3], a[4], a[5])
  };
  URI$$module$uri.prototype = {isAbsolute:function() {
    return void 0 !== this.authority || "/" === this.path.charAt(0)
  }, resolvePath:function(a) {
    a = resolvePaths$$module$uri(this.path, a);
    return(new URI$$module$uri(this.scheme, this.authority, a)).toString()
  }, resolveUri:function(a) {
    a instanceof URI$$module$uri || (a = URI$$module$uri.parse(a));
    if("data" === a.scheme) {
      return new URI$$module$uri(a.scheme, "", a.path)
    }
    var b = a.scheme || this.scheme, c = a.authority || this.authority, d = resolvePaths$$module$uri(this.path, a.path);
    return new URI$$module$uri(b, c, d, a.query, a.fragment)
  }, toString:function() {
    var a = this.path;
    this.authority && (a = "//" + this.authority + a);
    this.scheme && (a = this.scheme + ":" + a);
    this.query && (a += "?" + this.query);
    this.fragment && (a += "#" + this.fragment);
    return a
  }};
  module$uri.module$exports = URI$$module$uri;
  module$uri.module$exports && (module$uri = module$uri.module$exports);
  var module$asset$asset_resource = {}, URI$$module$asset$asset_resource = module$uri;
  function AssetResource$$module$asset$asset_resource(a) {
    var b, c;
    if(!a) {
      throw Error("AssetResource needs at least a valid url as parameter.");
    }
    "string" == typeof a ? b = a : (b = a.src, c = a.type);
    if(!b || "string" != typeof b) {
      throw Error("AssetResource: src parameter invalid: " + b);
    }
    this.src = b;
    c && "string" === typeof c ? this.type = c : (a = URI$$module$asset$asset_resource.parse(b), this.type = (a.path.match("data" === a.scheme ? /^(\w+\/\w+);/ : /\.([^.]+)$/) || [, null])[1]);
    if(!this.type) {
      throw Error("Cannot determine type of resource with src: " + b);
    }
  }
  module$asset$asset_resource.module$exports = AssetResource$$module$asset$asset_resource;
  module$asset$asset_resource.module$exports && (module$asset$asset_resource = module$asset$asset_resource.module$exports);
  var module$asset$asset_request = {}, AssetResource$$module$asset$asset_request = module$asset$asset_resource, tools$$module$asset$asset_request = module$tools, isArray$$module$asset$asset_request = tools$$module$asset$asset_request.isArray;
  function AssetRequest$$module$asset$asset_request(a) {
    var b, c;
    if(!a) {
      throw Error("AssetRequest needs at least a valid url.");
    }
    c = a.resources;
    b = a.loadLevel;
    if("string" === typeof a) {
      c = [new AssetResource$$module$asset$asset_request(a)]
    }else {
      if(isArray$$module$asset$asset_request(a)) {
        c = tools$$module$asset$asset_request.map(a, function(a) {
          return new AssetResource$$module$asset$asset_request(a)
        })
      }else {
        if(c && c.src || "string" === typeof c) {
          c = [new AssetResource$$module$asset$asset_request(c)]
        }else {
          if(isArray$$module$asset$asset_request(c) && c.length) {
            c = tools$$module$asset$asset_request.map(c, function(a) {
              return new AssetResource$$module$asset$asset_request(a)
            })
          }else {
            throw Error("resources are not valid.");
          }
        }
      }
    }
    this.resources = c;
    this.id = a.id;
    this.loadLevel = b || null
  }
  module$asset$asset_request.module$exports = AssetRequest$$module$asset$asset_request;
  module$asset$asset_request.module$exports && (module$asset$asset_request = module$asset$asset_request.module$exports);
  var module$asset$asset_handler = {}, AssetRequest$$module$asset$asset_handler = module$asset$asset_request, EventEmitter$$module$asset$asset_handler = module$event_emitter, tools$$module$asset$asset_handler = module$tools;
  AssetHandler$$module$asset$asset_handler.DEFAULT_TIMEOUT = 1E4;
  function AssetHandler$$module$asset$asset_handler(a, b, c) {
    this.timeoutDuration = c || AssetHandler$$module$asset$asset_handler.DEFAULT_TIMEOUT;
    this.request = a instanceof AssetRequest$$module$asset$asset_handler ? a : new AssetRequest$$module$asset$asset_handler(a);
    this.resources = this.request.resources;
    this.resourcesExpectedLength = this.resources.length;
    this.resourcesLoaded = 0;
    this.id = b;
    this.assetData = {};
    this.resourceLoadSuccess = tools$$module$asset$asset_handler.hitch(this, "resourceLoadSuccess");
    this.resourceLoadError = tools$$module$asset$asset_handler.hitch(this, "resourceLoadError")
  }
  var proto$$module$asset$asset_handler = AssetHandler$$module$asset$asset_handler.prototype = {load:function() {
    this.initTimeout();
    tools$$module$asset$asset_handler.forEach(this.resources, function(a) {
      this.loadResource(a, this.resourceLoadSuccess, this.resourceLoadError)
    }, this)
  }, initTimeout:function() {
    this._timeoutID = setTimeout(tools$$module$asset$asset_handler.hitch(this, function() {
      this.resourcesLoaded < this.resourcesExpectedLength && this.resourceLoadError("Timeout error when trying to load resources")
    }), this.timeoutDuration)
  }, registerElement:function(a) {
    this.emit("registerElement", a)
  }, resourceLoadSuccess:function(a) {
    tools$$module$asset$asset_handler.mixin(this.assetData, a);
    if((this.resourcesLoaded += 1) === this.resourcesExpectedLength) {
      clearTimeout(this._timeoutID), this.emit("resourcesLoaded"), this.emit("load", this.assetData)
    }
  }, resourceLoadError:function(a) {
    clearTimeout(this._timeoutID);
    this.emit("error", a)
  }};
  tools$$module$asset$asset_handler.mixin(proto$$module$asset$asset_handler, EventEmitter$$module$asset$asset_handler);
  module$asset$asset_handler.module$exports = AssetHandler$$module$asset$asset_handler;
  module$asset$asset_handler.module$exports && (module$asset$asset_handler = module$asset$asset_handler.module$exports);
  var module$asset$bitmap_handler = {}, AssetHandler$$module$asset$bitmap_handler = module$asset$asset_handler;
  function BitmapHandler$$module$asset$bitmap_handler() {
    AssetHandler$$module$asset$bitmap_handler.apply(this, arguments)
  }
  var proto$$module$asset$bitmap_handler = BitmapHandler$$module$asset$bitmap_handler.prototype = Object.create(AssetHandler$$module$asset$bitmap_handler.prototype);
  proto$$module$asset$bitmap_handler.loadResource = function(a, b, c) {
    var d = new Image;
    d.onload = function() {
      b({width:d.width, height:d.height})
    };
    d.onerror = function() {
      c("Could not load image")
    };
    d.src = a.src;
    if(d.complete) {
      d.onload()
    }
  };
  module$asset$bitmap_handler.module$exports = BitmapHandler$$module$asset$bitmap_handler;
  module$asset$bitmap_handler.module$exports && (module$asset$bitmap_handler = module$asset$bitmap_handler.module$exports);
  var module$asset$raw_handler = {}, AssetHandler$$module$asset$raw_handler = module$asset$asset_handler;
  function RawHandler$$module$asset$raw_handler() {
    AssetHandler$$module$asset$raw_handler.apply(this, arguments)
  }
  RawHandler$$module$asset$raw_handler.prototype = Object.create(AssetHandler$$module$asset$raw_handler.prototype);
  RawHandler$$module$asset$raw_handler.prototype.loadResource = function(a, b, c) {
    var d = new XMLHttpRequest;
    d.open("GET", a.src, !0);
    d.send(null);
    d.onreadystatechange = function() {
      4 == d.readyState && (200 <= d.status || 300 > d.status || 304 == d.status) ? b(d.responseText) : 404 === d.status && c(d.status)
    }
  };
  module$asset$raw_handler.module$exports = RawHandler$$module$asset$raw_handler;
  module$asset$raw_handler.module$exports && (module$asset$raw_handler = module$asset$raw_handler.module$exports);
  var module$asset$font_handler = {}, AssetHandler$$module$asset$font_handler = module$asset$asset_handler, RawHandler$$module$asset$font_handler = module$asset$raw_handler, tools$$module$asset$font_handler = module$tools, mimeToFormat$$module$asset$font_handler = FontHandler$$module$asset$font_handler.mimeToFormat = {woff:"woff", "font/woff":"woff", "application/x-woff":"woff", "application/x-font-woff":"woff", otf:"opentype", "font/otf":"opentype", "font/opentype":"opentype", "application/x-font-otf":"opentype", 
  "application/x-font-opentype":"opentype", ttf:"truetype", "font/ttf":"truetype", "font/truetype":"truetype", "application/x-font-ttf":"truetype", "application/x-font-truetype":"truetype", svg:"svg", "image/svg+xml":"svg", "application/vnd.ms-fontobject":"eot"}, formatToMime$$module$asset$font_handler = FontHandler$$module$asset$font_handler.formatToMime = {eot:"application/vnd.ms-fontobject", woff:"application/x-font-woff", otf:"font/opentype", svg:"image/svg+xml", ttf:"application/x-font-ttf"}, 
  styleElement$$module$asset$font_handler;
  FontHandler$$module$asset$font_handler.fontIDs = {};
  FontHandler$$module$asset$font_handler.prefix = "bs_" + (new Date).getTime() + "_";
  function FontHandler$$module$asset$font_handler() {
    AssetHandler$$module$asset$font_handler.apply(this, arguments);
    var a = this.request.id;
    this.fontFormats = [];
    this.fontId = FontHandler$$module$asset$font_handler.fontIDs[a] = FontHandler$$module$asset$font_handler.prefix + a;
    this.on("resourcesLoaded", function() {
      this.applyFontFace()
    })
  }
  FontHandler$$module$asset$font_handler.prototype = Object.create(AssetHandler$$module$asset$font_handler.prototype);
  FontHandler$$module$asset$font_handler.prototype.loadResource = function(a, b, c) {
    var d = this, e = a.src;
    /^data:/.test(e) ? b(e) : (new RawHandler$$module$asset$font_handler(e)).on("load", function() {
      var c;
      a.type in mimeToFormat$$module$asset$font_handler ? c = mimeToFormat$$module$asset$font_handler[a.type] : (c = a.type, console.warn("Resource type of " + a.type + " might be not supported by the Font type handler"));
      d.fontFormats.push({uri:e, format:c});
      b()
    }).on("error", function() {
      c("Cannot load font: " + e)
    }).load()
  };
  FontHandler$$module$asset$font_handler.prototype.applyFontFace = function(a, b) {
    a = this.fontId;
    b = this.fontFormats;
    styleElement$$module$asset$font_handler || (styleElement$$module$asset$font_handler = (document.getElementsByTagName("head") || [document.body])[0].appendChild(document.createElement("style")));
    var c, d, e = [], f = "";
    tools$$module$asset$font_handler.forEach(b, function(a) {
      d = a.uri;
      c = a.format;
      "eot" === c ? f = 'url("' + d + '") format("' + c + '")' : e.push('url("' + d + '") format("' + c + '")')
    });
    styleElement$$module$asset$font_handler.appendChild(document.createTextNode('@font-face {font-family: "' + a + '";\n' + (f ? "src: " + f + ";\n" : "") + (e.length ? 'src: local("\u263a"), ' + e.join(",\n") + ";\n" : "") + "}"))
  };
  module$asset$font_handler.module$exports = FontHandler$$module$asset$font_handler;
  module$asset$font_handler.module$exports && (module$asset$font_handler = module$asset$font_handler.module$exports);
  var module$asset$video_handler = {}, AssetHandler$$module$asset$video_handler = module$asset$asset_handler, domVideo$$module$asset$video_handler = "undefined" !== typeof document && document.createElement ? document.createElement("video") : 0, events$$module$asset$video_handler = {"start-with-nothing":"loadstart", metadata:"loadedmetadata", "risky-to-play":"loadeddata", "can-play":"canplay", "can-play-through":"canplaythrough"};
  function VideoHandler$$module$asset$video_handler() {
    AssetHandler$$module$asset$video_handler.apply(this, arguments)
  }
  VideoHandler$$module$asset$video_handler.prototype = Object.create(AssetHandler$$module$asset$video_handler.prototype);
  VideoHandler$$module$asset$video_handler.prototype.loadResource = function(a, b, c) {
    function d() {
      b({width:e.videoWidth, height:e.videoHeight})
    }
    var e, f = this.id, g = this.request.loadLevel || "can-play", h = a.type, a = a.src;
    !domVideo$$module$asset$video_handler.canPlayType(h) || this.hasInitiatedLoad ? this.resourcesExpectedLength-- : (this.hasInitiatedLoad = !0, e = document.createElement("video"), e.setAttribute("id", f), e.setAttribute("type", h), e.src = a, this.registerElement(e), e.addEventListener(events$$module$asset$video_handler[g], d, !1), e.addEventListener("error", function() {
      c("Could not load video.")
    }, !1), e.addEventListener("ended", function() {
    }, !1), e.addEventListener("play", function() {
    }, !1), e.addEventListener("pause", function() {
    }, !1))
  };
  module$asset$video_handler.module$exports = VideoHandler$$module$asset$video_handler;
  module$asset$video_handler.module$exports && (module$asset$video_handler = module$asset$video_handler.module$exports);
  var module$asset$asset_controller = {}, tools$$module$asset$asset_controller = module$tools, EventEmitter$$module$asset$asset_controller = module$event_emitter, AssetRequest$$module$asset$asset_controller = module$asset$asset_request, FontHandler$$module$asset$asset_controller = module$asset$font_handler, VideoHandler$$module$asset$asset_controller = module$asset$video_handler, BitmapHandler$$module$asset$asset_controller = module$asset$bitmap_handler, RawHandler$$module$asset$asset_controller = 
  module$asset$raw_handler;
  AssetController$$module$asset$asset_controller.assets = {};
  AssetController$$module$asset$asset_controller.hasVideoSupport = function() {
    return!!domVideo.canPlayType
  };
  function AssetController$$module$asset$asset_controller() {
  }
  var handlers$$module$asset$asset_controller = AssetController$$module$asset$asset_controller.handlers = {Bitmap:BitmapHandler$$module$asset$asset_controller, Font:FontHandler$$module$asset$asset_controller, Video:VideoHandler$$module$asset$asset_controller, Raw:RawHandler$$module$asset$asset_controller};
  AssetController$$module$asset$asset_controller.prototype = {destroy:function(a) {
    delete AssetController$$module$asset$asset_controller.assets[a]
  }, load:function(a, b, c) {
    var b = b || "assetLoadSuccess", c = c || "assetLoadError", d = a.type;
    if(d in handlers$$module$asset$asset_controller) {
      (new handlers$$module$asset$asset_controller[d](a.request, a.id)).on("registerElement", function(b) {
        AssetController$$module$asset$asset_controller.assets[a.id] = b
      }).on("load", this, function(c) {
        this.emit(b, tools$$module$asset$asset_controller.mixin(a, c))
      }).on("error", this, function(b) {
        a.err = b;
        this.emit(c, a)
      }).load()
    }else {
      throw Error("Type not found in AssetController.handlers: " + d);
    }
  }};
  tools$$module$asset$asset_controller.mixin(AssetController$$module$asset$asset_controller.prototype, EventEmitter$$module$asset$asset_controller);
  module$asset$asset_controller.module$exports = AssetController$$module$asset$asset_controller;
  module$asset$asset_controller.module$exports && (module$asset$asset_controller = module$asset$asset_controller.module$exports);
  var module$renderer$renderer_controller = {}, tools$$module$renderer$renderer_controller = module$tools, EventEmitter$$module$renderer$renderer_controller = module$event_emitter, URI$$module$renderer$renderer_controller = module$uri, hitch$$module$renderer$renderer_controller = tools$$module$renderer$renderer_controller.hitch;
  function RendererController$$module$renderer$renderer_controller(a, b, c, d) {
    this.renderer = a;
    this.assetController = b;
    this.runnerContext = c;
    this._movieOptions = this._cleanOptions(d);
    this.baseUrl = URI$$module$renderer$renderer_controller.parse(d.baseUrl);
    c.on("message", this, this.handleEvent);
    b.on("assetLoadSuccess", this, function(a) {
      this.post("assetLoadSuccess", a)
    });
    b.on("assetLoadError", this, function(a) {
      this.post("assetLoadError", a)
    });
    this.renderer.on("userevent", this, function(a, b) {
      this.post("userevent", {event:a, targetId:b})
    });
    this.renderer.on("canRender", tools$$module$renderer$renderer_controller.hitch(this, this.postAsync, "canRender"));
    c.init(d)
  }
  var proto$$module$renderer$renderer_controller = RendererController$$module$renderer$renderer_controller.prototype = {_onRunnerContextReady:function() {
    function a(a, b) {
      var g = a.length, h = 0;
      tools$$module$renderer$renderer_controller.forEach(a, function(a) {
        d.load(c.baseUrl.resolveUri(a).toString())
      });
      d.on("scriptLoaded", function() {
        ++h === g && b()
      })
    }
    var b = this._movieOptions, c = this, d = this.runnerContext;
    b.url && (b.urls || (b.urls = [])).push(b.url);
    b.plugins && b.plugins.length ? a(b.plugins, function() {
      d.notifyRunner({command:"exposePluginExports"});
      b.urls ? a(b.urls, function() {
        b.code && d.run(b.code);
        c.emit("load")
      }) : b.code && d.run(b.code)
    }) : b.urls ? a(b.urls, function() {
      b.code && d.run(b.code);
      c.emit("load")
    }) : b.code && d.run(b.code)
  }, initRenderer:function() {
    this._sendOptions();
    return this
  }, _cleanOptions:function(a) {
    a || (a = {});
    var b = this.renderer;
    a.framerate = +a.framerate || void 0;
    a.width = b.width;
    a.height = b.height;
    return a
  }, destroy:function() {
    this.renderer.destroy();
    delete this.renderer;
    this.runnerContext.destroy();
    delete this.runnerContext;
    return this
  }, debug:function(a) {
    console.log.apply(console, ["RUNNER DEBUG:"].concat(a))
  }, freeze:function() {
    return this.post("freeze")
  }, handleEvent:function(a) {
    var b = a.data;
    switch(a.command) {
      case "render":
        this.currentFrame = a.frame;
        this.renderer.render(b);
        break;
      case "renderConfig":
        this.renderer.config(b);
        break;
      case "play":
      ;
      case "stop":
      ;
      case "freeze":
      ;
      case "unfreeze":
        this.emit(a.command, b);
        break;
      case "debug":
        this.debug(b);
        break;
      case "loadAsset":
        this.assetController.load(b);
        break;
      case "destroyAsset":
        this.assetController.destroy(b.id);
        break;
      case "message":
        this.emit("message", b);
        break;
      case "isReady":
        this.isRunnerListening = !0, this._sendOptions(), this._onRunnerContextReady(), this.emit("start")
    }
  }, _sendOptions:function() {
    if(this.isRunnerListening) {
      this.isReady || (this._sendEnvData(), this.isReady = !0);
      var a = tools$$module$renderer$renderer_controller.mixin({}, this._movieOptions);
      a.baseUrl = a.baseUrl && a.baseUrl.toString();
      a.assetBaseUrl = a.assetBaseUrl && a.assetBaseUrl.toString();
      this.post("options", a)
    }
    return this
  }, play:function(a) {
    return this.post("play", a)
  }, post:function(a, b) {
    this.runnerContext.notifyRunner({command:a, data:b});
    return this
  }, postAsync:function(a, b) {
    this.runnerContext.notifyRunnerAsync({command:a, data:b});
    return this
  }, _sendEnvData:function() {
    if(!this._isEnvSenderSetup) {
      if("undefined" !== typeof window) {
        var a = tools$$module$renderer$renderer_controller.hitch(this, this._sendEnvData);
        window.addEventListener("resize", a, !1);
        window.addEventListener("scroll", a, !1)
      }
      this._isEnvSenderSetup = !0
    }
    a = this.renderer.getOffset();
    "undefined" !== typeof window && this.post("env", {windowHeight:window.innerHeight, windowWidth:window.innerWidth, windowScrollX:Math.max(document.body.scrollLeft, document.documentElement.scrollLeft), windowScrollY:Math.max(document.body.scrollTop, document.documentElement.scrollTop), offsetX:a.left, offsetY:a.top})
  }, sendMessage:function(a) {
    return this.post("message", a)
  }, stop:function(a) {
    return this.post("stop", a)
  }, unfreeze:function() {
    return this.post("unfreeze")
  }};
  tools$$module$renderer$renderer_controller.mixin(proto$$module$renderer$renderer_controller, EventEmitter$$module$renderer$renderer_controller);
  module$renderer$renderer_controller.module$exports = RendererController$$module$renderer$renderer_controller;
  module$renderer$renderer_controller.module$exports && (module$renderer$renderer_controller = module$renderer$renderer_controller.module$exports);
  var module$renderer$svg$svg = {}, EventEmitter$$module$renderer$svg$svg = module$event_emitter, tools$$module$renderer$svg$svg = module$tools, color$$module$renderer$svg$svg = module$color, segmentHelper$$module$renderer$svg$svg = module$segment_helper, svgFilters$$module$renderer$svg$svg = module$renderer$svg$svg_filters, svgHelper$$module$renderer$svg$svg = module$renderer$svg$svg_helper, eventHandlers$$module$renderer$svg$svg = module$renderer$svg$svg_event_handlers, AssetController$$module$renderer$svg$svg = 
  module$asset$asset_controller, elCache$$module$renderer$svg$svg = {}, isWebkitPatternBug$$module$renderer$svg$svg = /AppleWebKit\/53([0-3]|4.([0-4]))/.test(navigator.appVersion), cssClasses$$module$renderer$svg$svg = svgHelper$$module$renderer$svg$svg.cssClasses, matrixToString$$module$renderer$svg$svg = svgHelper$$module$renderer$svg$svg.matrixToString, gradientToSignature$$module$renderer$svg$svg = svgHelper$$module$renderer$svg$svg.gradientToSignature, filterToSignature$$module$renderer$svg$svg = 
  svgHelper$$module$renderer$svg$svg.filterToSignature, valueFromSignatureForType$$module$renderer$svg$svg = svgHelper$$module$renderer$svg$svg.valueFromSignatureForType, exportToPath$$module$renderer$svg$svg = segmentHelper$$module$renderer$svg$svg.exportToPath, isFEColorMatrixEnabled$$module$renderer$svg$svg = svgFilters$$module$renderer$svg$svg.isFEColorMatrixEnabled, colorApplyColorMatrix$$module$renderer$svg$svg = svgFilters$$module$renderer$svg$svg.colorApplyColorMatrix, filterElementsFromList$$module$renderer$svg$svg = 
  svgFilters$$module$renderer$svg$svg.filterElementsFromList, fontIDs$$module$renderer$svg$svg = AssetController$$module$renderer$svg$svg.handlers.Font.fontIDs, fontPrefix$$module$renderer$svg$svg = AssetController$$module$renderer$svg$svg.handlers.Font.prefix, basicAttributeMap$$module$renderer$svg$svg = {cap:"stroke-linecap", join:"stroke-linejoin", miterLimit:"stroke-miterlimit", opacity:"opacity", fillOpacity:"fill-opacity", strokeOpacity:"stroke-opacity", fontSize:"font-size", fontWeight:"font-weight", 
  fontStyle:"font-style", textAnchor:"text-anchor", text:"text", cursor:"cursor", fillRule:"fill-rule"}, eventTypes$$module$renderer$svg$svg = "dblclick click mouseenter mouseleave mouseover mouseout mouseup mousedown touchstart touchend mousemove touchmove mousewheel".split(" "), isArray$$module$renderer$svg$svg = tools$$module$renderer$svg$svg.isArray, xlink$$module$renderer$svg$svg = "http://www.w3.org/1999/xlink";
  function createElement$$module$renderer$svg$svg(a, b) {
    if(!a) {
      throw TypeError("Invalid tag name: " + a);
    }
    var c = (elCache$$module$renderer$svg$svg[a] || (elCache$$module$renderer$svg$svg[a] = document.createElementNS("http://www.w3.org/2000/svg", a))).cloneNode(!1);
    (b || 0 === b) && c.setAttribute("data-bs-id", b);
    return c
  }
  function Svg$$module$renderer$svg$svg(a, b, c) {
    var d = this.root = this[0] = createElement$$module$renderer$svg$svg("svg", 0);
    b && d.setAttribute("width", b);
    c && d.setAttribute("height", c);
    svgHelper$$module$renderer$svg$svg.cssClasses.add(d, "nonSelectable");
    this.viewBox(b, c);
    this.defs = this.root.appendChild(createElement$$module$renderer$svg$svg("defs"));
    a.appendChild(d)
  }
  Svg$$module$renderer$svg$svg.prototype = {viewBox:function(a, b) {
    a && b && this.root.setAttribute("viewBox", "-0.5 -0.5 " + a + " " + b)
  }, attr:function(a, b) {
    var c, d;
    for(d in b) {
      if(c = b[d], d in basicAttributeMap$$module$renderer$svg$svg) {
        null != c ? a.setAttribute(basicAttributeMap$$module$renderer$svg$svg[d], c) : null === c && a.removeAttribute(basicAttributeMap$$module$renderer$svg$svg[d])
      }else {
        switch(d) {
          case "fontFamily":
            c = fontIDs$$module$renderer$svg$svg[c] || c;
            null != c ? a.setAttribute("font-family", c) : null === c && a.removeAttribute("font-family");
            break;
          case "strokeWidth":
            a.setAttribute("stroke-width", c);
            0 >= c ? (c = a.getAttribute("stroke")) && a.setAttribute("data-stroke", c) : "strokeColor" in b || (c = a.getAttribute("data-stroke")) && a.setAttribute("stroke", c);
            break;
          case "matrix":
            null != c ? a.setAttribute("transform", matrixToString$$module$renderer$svg$svg(c)) : null === c && a.removeAttribute("transform")
        }
      }
    }
  }};
  function SvgRenderer$$module$renderer$svg$svg(a, b, c, d, e) {
    this.width = b;
    this.height = c;
    this.allowEventDefaults = !!d;
    var f = this.svg = new Svg$$module$renderer$svg$svg(a, b, c);
    this.definitions = Object.create(null);
    eventTypes$$module$renderer$svg$svg.forEach(function(a) {
      f.root.addEventListener(a, this, !1)
    }, this);
    document.addEventListener("touchmove", Boolean, !1);
    document.addEventListener("keyup", this, !1);
    document.addEventListener("keydown", this, !1);
    document.addEventListener("keypress", this, !1);
    this._setupFPSLog(e)
  }
  var proto$$module$renderer$svg$svg = SvgRenderer$$module$renderer$svg$svg.prototype = tools$$module$renderer$svg$svg.mixin({}, EventEmitter$$module$renderer$svg$svg, eventHandlers$$module$renderer$svg$svg), typesToTags$$module$renderer$svg$svg = {Bitmap:"image", Group:"g", Movie:"g", Path:"path", Text:"text", TextSpan:"tspan", Video:"foreignObject", Mask:"mask"};
  proto$$module$renderer$svg$svg.config = function(a) {
    var b = a.value;
    switch(a.item) {
      case "crispEdges":
        this.svg.root.setAttribute("shape-rendering", b ? "crispEdges" : "auto");
        break;
      case "backgroundColor":
        this.svg.root.style.backgroundColor = color$$module$renderer$svg$svg(b).rgba()
    }
  };
  proto$$module$renderer$svg$svg.render = function(a) {
    var b, c, d, e, f, g, h, j = this, i = this.svg, k = {}, l = {};
    for(e = 0;f = a[e++];) {
      if(b = f.id, h = f.type, "bitmap_hidden" !== h) {
        if(f.offStageType && 0 === f.parent && (f.parent = f.id + "_offStageParent"), c = i[b], !c && !f.detach && ("DOMElement" === h ? (c = i[b] = document.createElement(f.attributes.nodeName), c.setAttribute("data-bs-id", b)) : c = i[b] = createElement$$module$renderer$svg$svg(typesToTags$$module$renderer$svg$svg[h], b)), f.detach) {
          f = f.children || 0;
          h = 0;
          do {
            c && this.removeObject(c), delete i[b], b = f[h], c = i[b], h += 1
          }while(c)
        }else {
          "parent" in f && (g = f.parent, (l[g] || (l[g] = [])).push(b), k[b] = f);
          if(this[b = "draw" + h]) {
            this[b](c, f), this.drawAll(h, c, f)
          }
          !isFEColorMatrixEnabled$$module$renderer$svg$svg && "Group" === h && function n(a, b) {
            if(b) {
              var c = a.firstChild || {};
              do {
                c instanceof SVGGElement && n(c, c._filterSignature);
                c._fillColorSignature && j.applyFillColor(c, c._fillColorSignature, b);
                c._strokeColorSignature && j.applyStrokeColor(c, c._strokeColorSignature, b);
                c._fillGradientSignature && j.applyFillGradient(c, c._fillGradientSignature, null, b)
              }while(c = c.nextSibling)
            }
          }(c, c._filterSignature);
          f.attributes && i.attr(c._root || c, f.attributes)
        }
      }
    }
    for(g in l) {
      c = l[g];
      a = [];
      for(e = 0;b = c[e++];) {
        f = k[b], (b = k[f.next]) ? b.prev = f : a.push(f)
      }
      for(e = 0;f = a[e++];) {
        if(g = i[f.parent]) {
          h = f.prev;
          c = i[f.id];
          c = c._root || c;
          if(h) {
            d || (d = document.createDocumentFragment());
            d.appendChild(c);
            do {
              b = c, c = i[h.id], c = c._root || c, d.insertBefore(c, b)
            }while(h = h.prev);
            c = d
          }
          g.insertBefore(c, i[f.next] || null)
        }
      }
    }
    this._logFrame();
    this.emit("canRender")
  };
  proto$$module$renderer$svg$svg.drawMovie = function() {
  };
  proto$$module$renderer$svg$svg.drawGroup = function() {
  };
  proto$$module$renderer$svg$svg.drawAll = function(a, b, c) {
    var d = c.attributes, e = d.filters, f = d.fillColor, g = d.fillGradient;
    !isFEColorMatrixEnabled$$module$renderer$svg$svg && !f && (e && b._fillColorSignature) && (f = b._fillColorSignature);
    isArray$$module$renderer$svg$svg(e) && (0 < e.length ? this.applyFilters(b, e) : this.removeFilters(b));
    "clip" === c.offStageType && (d.fillImage = null, g = d.fillGradient = null, f = d.fillColor = 4294967295);
    d.clipId ? (e = d.clipId + "_offStageParent", (b._clip = this.svg[e]) ? b._clip !== this.svg[e] && b._clip.n++ : (b._clip = this.svg[e] = this.svg.defs.appendChild(createElement$$module$renderer$svg$svg("mask")), b._clip.id = this._genDefUID(), b._clip._clipId = e, b._clip.n = 1), b.setAttribute("mask", "url(#" + b._clip.id + ")")) : null === d.clipId && this.removeClip(b);
    d.maskId ? this.applyMask(b, d) : null === d.maskId && this.removeMask(b);
    null != d.visible && (b.style.visibility = d.visible ? "" : "hidden");
    if("Path" === a || "Text" === a || "TextSpan" === a) {
      d.fillImageId || g && (f || d.fillRepeat && "1,1" !== d.fillRepeat.join()) ? isWebkitPatternBug$$module$renderer$svg$svg ? this.applyWebkitFills(b, c) : this.applyFills(b, c.attributes) : g ? this.applyFillGradient(b, g, d.matrix) : null != f && this.applyFillColor(b, f), "fillImageId" in d && !d.fillImageId && this.removeFillImage(b), "strokeColor" in d && this.applyStrokeColor(b, d.strokeColor, "", d.strokeWidth), "strokeGradient" in d && this.applyStrokeGradient(b, d.strokeGradient, "", 
      d.strokeWidth)
    }
  };
  proto$$module$renderer$svg$svg.drawPath = function(a, b) {
    var c = b.data;
    c && a.setAttribute("d", exportToPath$$module$renderer$svg$svg(c, !0))
  };
  proto$$module$renderer$svg$svg.drawBitmap = function(a, b) {
    var c = b.attributes;
    a.setAttribute("preserveAspectRatio", "none");
    var d = c.naturalWidth, e = c.naturalHeight, f = e / d;
    null != c.absoluteUrl && a.setAttributeNS(xlink$$module$renderer$svg$svg, "href", c.absoluteUrl);
    null == c.width && null == c.height && (c.width = d, c.height = e);
    null == c.height && (c.height = (c.width || 0) * f);
    null == c.width && (c.width = (c.height || 0) / f);
    c.height && a.setAttribute("height", c.height);
    c.width && a.setAttribute("width", c.width)
  };
  proto$$module$renderer$svg$svg.drawTextSpan = function(a, b) {
    var c = b.attributes;
    a.setAttributeNS(xlink$$module$renderer$svg$svg, "text-anchor", "start");
    a.setAttribute("alignment-baseline", "inherit");
    !1 !== c.selectable ? cssClasses$$module$renderer$svg$svg.add(a, "selectable") : cssClasses$$module$renderer$svg$svg.remove(a, "selectable");
    c.glyphx ? a.setAttribute("x", c.glyphx.join(" ")) : null === c.glyphx && a.removeAttribute("x");
    c.glyphy ? a.setAttribute("y", c.glyphy.join(" ")) : null === c.glyphy && a.removeAttribute("y");
    if(a._text !== c.text) {
      for(;a.firstChild;) {
        a.removeChild(a.firstChild)
      }
      a._text = c.text;
      a.appendChild(document.createTextNode(c.text))
    }
  };
  proto$$module$renderer$svg$svg.drawText = function(a, b) {
    var c = b.attributes;
    !1 !== c.selectable ? cssClasses$$module$renderer$svg$svg.add(a, "selectable") : cssClasses$$module$renderer$svg$svg.remove(a, "selectable");
    a.setAttributeNS(xlink$$module$renderer$svg$svg, "text-anchor", "start");
    null != c.textOrigin && a.setAttribute("alignment-baseline", "top" === c.textOrigin ? "hanging" : "");
    a.style.textAnchor = "start"
  };
  proto$$module$renderer$svg$svg.drawVideo = function(a, b) {
    var c = b.attributes, d = b.id, e = AssetController$$module$renderer$svg$svg.assets[d];
    if("undefined" === typeof e) {
      throw Error("asset <" + d + "> is unkown.");
    }
    var d = c.width || 100, f = c.height || 100, g = c.matrix || {tx:0, ty:0};
    a.setAttribute("x", g.tx);
    a.setAttribute("y", g.ty);
    a.setAttribute("width", d);
    a.setAttribute("height", f);
    a.setAttribute("preserveAspectRatio", "none");
    a.removeAttribute("transform");
    e.setAttribute("width", d);
    e.setAttribute("height", f);
    e.setAttribute("controls", "controls");
    c.autoplay && e.play();
    a.appendChild(e)
  };
  proto$$module$renderer$svg$svg.drawDOMElement = function(a, b) {
    var c, d = b.attributes;
    if((c = this.svg[b.parent]) && !a._root && !(c instanceof HTMLElement)) {
      c = document.createElementNS("http://www.w3.org/1999/xhtml", "body"), a._root = createElement$$module$renderer$svg$svg("foreignObject", b.id), a._root.appendChild(c), c.appendChild(a), a._root.setAttribute("width", "100%"), a._root.setAttribute("height", "100%")
    }
    a._root && ("css_width" in d && /px$/.test(d.css_width) && a._root.setAttribute("width", d.css_width), "css_height" in d && /px$/.test(d.css_height) && (a._root.setAttribute("height", d.css_height), a._root._height = d.css_height));
    a._isBSDOMElement = !0;
    for(var e in d) {
      /^dom_/.test(e) ? "dom_innerHTML" === e ? a.innerHTML = (d[e] || "").replace(/\{\{prefix\}\}/g, fontPrefix$$module$renderer$svg$svg) : a.setAttribute(e.slice(4), d[e]) : /^css_/.test(e) && "undefined" !== typeof d[e] && (a.style[e.slice(4)] = d[e].toString().replace(/\{\{prefix\}\}/g, fontPrefix$$module$renderer$svg$svg))
    }
    if("dom_innerHTML" in d && a.parentNode) {
      d = a;
      e = a._root;
      if(!e) {
        for(;(d = d.parentNode) && !(e = d._root);) {
        }
      }
      e.setAttribute("height", e._height || "100%")
    }
  };
  proto$$module$renderer$svg$svg.removeObject = function(a) {
    var b = a._root || a, c = b.parentNode;
    c && c.removeChild(b);
    a._pattern && (this.removeFillImage(a), this.svg.defs.removeChild(a._pattern), a._pattern._fillGradientSignature && this.removeGradient(a._pattern, "fill"));
    a._fillGradientSignature && this.removeGradient(a, "fill");
    a._strokeGradientSignature && this.removeGradient(a, "stroke");
    this.removeMask(a);
    this.removeFilters(a)
  };
  proto$$module$renderer$svg$svg.removeFilters = function(a) {
    var b = a._filterSignature, c = this.definitions[b];
    c && (1 < c.n ? c.n-- : (this.svg.defs.removeChild(c.element), delete this.definitions[b]), a.removeAttribute("filter"), delete a._filterSignature)
  };
  proto$$module$renderer$svg$svg.removeFillImage = function(a) {
    if((a = a._pattern) && a._fillImage) {
      a.removeChild(a._fillImage), delete this.svg[a._fillImage._fillImageId], delete a._fillImage
    }
  };
  proto$$module$renderer$svg$svg.removeGradient = function(a, b) {
    var c = a["_" + b + "GradientSignature"], d = this.definitions[c];
    d && (1 < d.n ? d.n-- : (this.svg.defs.removeChild(d.element), delete this.definitions[c]), delete a["_" + b + "GradientSignature"])
  };
  proto$$module$renderer$svg$svg.removeClip = function(a) {
    var b = a._clip;
    b && (1 < b.n ? b.n-- : (this.svg.defs.removeChild(b), delete this.svg[b._clipId]), a.removeAttribute("mask"), delete a._clip)
  };
  proto$$module$renderer$svg$svg.removeMask = function(a) {
    var b = a._mask;
    b && (1 < b.n ? b.n-- : (this.svg.defs.removeChild(b), delete this.svg[b._maskId]), a.removeAttribute("mask"), delete a._mask)
  };
  proto$$module$renderer$svg$svg.destroy = function() {
    var a = this.svg;
    eventTypes$$module$renderer$svg$svg.forEach(function(b) {
      a.root.removeEventListener(b, this, !1)
    }, this);
    document.removeEventListener("keyup", this, !1);
    document.removeEventListener("keydown", this, !1);
    document.removeEventListener("keypress", this, !1);
    clearInterval(this._fpsInterval);
    a.root.parentNode && a.root.parentNode.removeChild(a.root);
    delete this.svg
  };
  proto$$module$renderer$svg$svg._genDefUID = function() {
    return"def-" + +new Date + "-" + (this.__defID = this.__defID ? this.__defID + 1 : 1)
  };
  proto$$module$renderer$svg$svg.applyFillColor = function(a, b, c) {
    return this.applyColor("fill", a, b, c)
  };
  proto$$module$renderer$svg$svg.applyStrokeColor = function(a, b, c, d) {
    null != b ? 0 < d || +a.getAttribute("stroke-width") ? this.applyColor("stroke", a, b, c) : this.applyColor("data-stroke", a, b, c) : null === b && (a.removeAttribute("stroke"), a.removeAttribute("data-stroke"))
  };
  proto$$module$renderer$svg$svg.applyStrokeGradient = function(a, b, c, d) {
    null != b ? 0 < d || +a.getAttribute("stroke-width") ? this.applyGradient("stroke", a, b, b.matrix, c) : this.applyGradient("data-stroke", a, b, b.matrix, c) : null === b && (a.removeAttribute("stroke"), a.removeAttribute("data-stroke"))
  };
  proto$$module$renderer$svg$svg.applyColor = function(a, b, c, d) {
    d = b._filterSignature || d;
    b["_" + a + "ColorSignature"] = c;
    c = color$$module$renderer$svg$svg(c);
    !isFEColorMatrixEnabled$$module$renderer$svg$svg && d && (d = valueFromSignatureForType$$module$renderer$svg$svg(d, "colorMatrix")) && c.setColorMatrix(d.split(","));
    b.setAttribute(a, c.rgba())
  };
  proto$$module$renderer$svg$svg.applyFillGradient = function(a, b, c, d) {
    return this.applyGradient("fill", a, b, c, d)
  };
  proto$$module$renderer$svg$svg.applyGradient = function(a, b, c, d, e) {
    var e = b._filterSignature || e, f, g, h, j, i, k, d = c.stops, l = gradientToSignature$$module$renderer$svg$svg(c), m = "_" + a + "GradientSignature";
    !isFEColorMatrixEnabled$$module$renderer$svg$svg && e && (e = valueFromSignatureForType$$module$renderer$svg$svg(e, "colorMatrix")) && (f = e.split(","));
    if(!f && l in this.definitions) {
      e = this.definitions[l], b[m] !== l && (e.n++, b[m] = l, b.setAttribute(a, "url(#" + e.element.id + ")"))
    }else {
      if(b[m]) {
        if(e = this.definitions[b[m]], 1 < e.n) {
          e.n--
        }else {
          delete this.definitions[b[m]];
          for(g = e.element;e = g.firstChild;) {
            g.removeChild(e)
          }
        }
      }
      b[m] = l;
      switch(c.type) {
        case "linear-gradient":
          if(isNaN(c.direction)) {
            m = c.direction
          }else {
            if(e = 360 - c.direction - 270, 0 > e && (e += 360), e = -e, m = [0, 0, Math.cos(Math.PI / 180 * e), Math.sin(Math.PI / 180 * e)], e = 1 / (Math.max(Math.abs(m[2]), Math.abs(m[3])) || 1), m[2] *= e, m[3] *= e, 0 > m[2] && (m[0] = -m[2], m[2] = 0), 0 > m[3]) {
              m[1] = -m[3], m[3] = 0
            }
          }
          g || (g = createElement$$module$renderer$svg$svg("linearGradient"), g.setAttribute("gradientTransform", matrixToString$$module$renderer$svg$svg(c.matrix)), g.setAttribute("gradientUnits", "boundingBox" == c.units ? "objectBoundingBox" : "userSpaceOnUse"), g.setAttribute("spreadMethod", "PAD"), g.id = this._genDefUID());
          i = 0;
          for(k = d.length;i < k;++i) {
            h = d[i], e = createElement$$module$renderer$svg$svg("stop"), j = f ? color$$module$renderer$svg$svg(h[0]).setColorMatrix(f) : color$$module$renderer$svg$svg(h[0]), e.setAttribute("offset", h[1] + "%"), e.setAttribute("stop-color", j.rgb()), e.setAttribute("stop-opacity", j.a()), g.appendChild(e)
          }
          g.setAttribute("x1", m[0]);
          g.setAttribute("y1", m[1]);
          g.setAttribute("x2", m[2]);
          g.setAttribute("y2", m[3]);
          break;
        case "radial-gradient":
          g || (g = createElement$$module$renderer$svg$svg("radialGradient"), g.setAttribute("gradientUnits", "boundingBox" == c.units ? "objectBoundingBox" : "userSpaceOnUse"), g.setAttribute("spreadMethod", "PAD"), g.id = this._genDefUID());
          g.setAttribute("gradientTransform", matrixToString$$module$renderer$svg$svg(c.matrix));
          i = 0;
          for(k = d.length;i < k;++i) {
            h = d[i], e = createElement$$module$renderer$svg$svg("stop"), j = f ? color$$module$renderer$svg$svg(h[0]).setColorMatrix(f) : color$$module$renderer$svg$svg(h[0]), e.setAttribute("offset", h[1] + "%"), e.setAttribute("stop-color", j.rgb()), e.setAttribute("stop-opacity", j.a()), g.appendChild(e)
          }
          g.setAttribute("cx", "0%");
          g.setAttribute("cy", "0%");
          g.setAttribute("r", c.radius);
          g.setAttribute("fx", c.fx);
          g.setAttribute("fy", c.fy)
      }
      this.svg.defs.appendChild(g);
      b.setAttribute(a, "url(#" + g.id + ")");
      this.definitions[l] = {n:1, element:g}
    }
  };
  proto$$module$renderer$svg$svg.applyWebkitFills = function(a, b) {
    var c, d, e = b.attributes, f = this.svg, g = f.defs, h = e.fillColor, j = e.fillGradient, i = (d = a._friend) && d._fillImage, k = d && d._fillGradient, l = d && d._fillColor, m = !(d && d._pattern);
    f.root.appendChild(a);
    m && (c = a.getBBox(), d = function(a, b, c, d) {
      var e = createElement$$module$renderer$svg$svg("g", a);
      b[a] = e;
      d.tx += c.x;
      d.ty += c.y;
      e.setAttribute("transform", matrixToString$$module$renderer$svg$svg(d));
      return e
    }(b.id, f, c, e.matrix), function(b, c, e) {
      b = createElement$$module$renderer$svg$svg("mask");
      b.id = c;
      e.appendChild(b);
      d._pattern = b;
      d.setAttribute("mask", "url(#" + c + ")");
      b.appendChild(a)
    }(d, this._genDefUID(), g), a._friend = d, e.matrix.tx = -1 * c.x, e.matrix.ty = -1 * c.y, a.setAttribute("fill", "rgba(255, 255, 255, 1)"), a._friend = d);
    !i && e.fillImageId && (i = d._fillImage = createElement$$module$renderer$svg$svg("g"), i._fillImageId = e.fillImageId + "_offStageParent", f[i._fillImageId] = i);
    !k && j && (c || (c = a.getBBox()), k = d._fillGradient = createElement$$module$renderer$svg$svg("rect"), k.setAttribute("x", 0), k.setAttribute("y", 0), k.setAttribute("width", c.width), k.setAttribute("height", c.height));
    h && (l = d._fillColor = createElement$$module$renderer$svg$svg("rect"), l.setAttribute("x", 0), l.setAttribute("y", 0), l.setAttribute("width", c.width), l.setAttribute("height", c.height), l._fillColorSignature !== h ? this.applyFillColor(l, h) : 0 !== l._fillColorSignature && this.applyFillColor(l, 0));
    j && (this.applyFillGradient(k, j, e.matrix), d._fillGradientSignature = k._fillGradientSignature);
    m && (l && d.appendChild(l), k && d.appendChild(k), i && d.appendChild(i))
  };
  proto$$module$renderer$svg$svg.applyFills = function(a, b) {
    var c, d, e = this.svg.defs, f = (d = b.fillRepeat) && d[0] || 1, g = d && d[1] || 1, h = b.fillColor, j = b.fillGradient, i = a._pattern, k = i && i._fillImage, l = i && i._fillGradient, m = i && i._fillColor, n = !i;
    this.svg.root.appendChild(a);
    n && (c = a.getBBox(), i = a._pattern = createElement$$module$renderer$svg$svg("pattern"), m = i._fillColor = createElement$$module$renderer$svg$svg("rect"), i.setAttribute("patternUnits", "userSpaceOnUse"), i.setAttribute("x", 0), i.setAttribute("y", 0), i.setAttribute("width", c.width / f), i.setAttribute("height", c.height / g), d = tools$$module$renderer$svg$svg.mixin({}, b.matrix), d.tx = c.x, d.ty = c.y, i.setAttribute("patternTransform", matrixToString$$module$renderer$svg$svg(d)), m.setAttribute("x", 
    0), m.setAttribute("y", 0), m.setAttribute("width", c.width / f), m.setAttribute("height", c.height / g));
    !l && j && (c || (c = a.getBBox()), l = i._fillGradient = createElement$$module$renderer$svg$svg("rect"), l.setAttribute("x", 0), l.setAttribute("y", 0), l.setAttribute("width", c.width / f), l.setAttribute("height", c.height / g));
    !k && b.fillImageId && (k = i._fillImage = createElement$$module$renderer$svg$svg("g"), k._fillImageId = b.fillImageId + "_offStageParent", this.svg[k._fillImageId] = k);
    h ? m._fillColorSignature !== h && this.applyFillColor(m, h) : 0 !== m._fillColorSignature && this.applyFillColor(m, 0);
    j && (this.applyFillGradient(l, j, b.matrix), i._fillGradientSignature = l._fillGradientSignature);
    n && (i.appendChild(m), l && i.appendChild(l), k && i.appendChild(k), i.id = this._genDefUID(), a.setAttribute("fill", "url(#" + i.id + ")"), e.appendChild(i))
  };
  proto$$module$renderer$svg$svg.applyFilters = function(a, b) {
    var c, d;
    d = "filter:" + b.map(function(a) {
      return filterToSignature$$module$renderer$svg$svg(a)
    }).join();
    if(d in this.definitions) {
      c = this.definitions[d], a._filterSignature !== d && (c.n++, a._filterSignature = d, a.setAttribute("filter", "url(#" + c.element.id + ")"))
    }else {
      this.removeFilters(a);
      c = createElement$$module$renderer$svg$svg("filter");
      c.id = this._genDefUID();
      c.setAttribute("x", "-100%");
      c.setAttribute("y", "-100%");
      c.setAttribute("width", "300%");
      c.setAttribute("height", "300%");
      for(var e = filterElementsFromList$$module$renderer$svg$svg(b), f = 0, g = e.length;f < g;f += 1) {
        c.appendChild(e[f])
      }
      this.svg.defs.appendChild(c);
      a.setAttribute("filter", "url(#" + c.id + ")");
      a._filterSignature = d;
      this.definitions[d] = {n:1, element:c}
    }
  };
  proto$$module$renderer$svg$svg.applyMask = function(a, b) {
    var c = b.maskId + "_offStageParent", d = this.svg;
    (a._mask = d[c]) ? a._mask !== d[c] && a._mask.n++ : (a._mask = d[c] = d.defs.appendChild(createElement$$module$renderer$svg$svg("mask")), a._mask.id = this._genDefUID(), a._mask._maskId = c, a._mask.n = 1);
    a.setAttribute("mask", "url(#" + a._mask.id + ")")
  };
  proto$$module$renderer$svg$svg.getOffset = function() {
    var a, b = this.svg.root.getBoundingClientRect();
    if(isNaN(b.left) || isNaN(b.top)) {
      a = this.svg.root.getScreenCTM(), b.left = a.e, b.top = a.f
    }
    return b
  };
  proto$$module$renderer$svg$svg._setupFPSLog = function(a) {
    var b = "function" === typeof a;
    !0 !== a || b || (b || this.render([{parent:0, id:0.5, type:"Text", attributes:{matrix:{a:1, b:0, c:0, d:1, tx:10, ty:20}}}]), this._fpsInterval = setInterval(tools$$module$renderer$svg$svg.hitch(this, function() {
      var c = this.getFPS();
      b ? a(c) : (this.render([{id:0.6, parent:0.5, type:"TextSpan", attributes:{text:c + "FPS", textFillColor:255, fontFamily:"Arial"}}]), this.svg.root.appendChild(this.svg[0.5]))
    }), 1E3))
  };
  proto$$module$renderer$svg$svg._logFrame = function() {
    (this._frameTimes || (this._frameTimes = [])).push(+new Date)
  };
  proto$$module$renderer$svg$svg.getFPS = function() {
    for(var a = this._frameTimes, b = 0, c = +new Date - 1E3, d = a.length;d-- && !(a[d] < c);) {
      ++b
    }
    this._frameTimes = a.slice(d);
    return b
  };
  SvgRenderer$$module$renderer$svg$svg.Svg = Svg$$module$renderer$svg$svg;
  module$renderer$svg$svg.module$exports = SvgRenderer$$module$renderer$svg$svg;
  module$renderer$svg$svg.module$exports && (module$renderer$svg$svg = module$renderer$svg$svg.module$exports);
  var module$runner$asset_display_object = {}, tools$$module$runner$asset_display_object = module$tools, DisplayObject$$module$runner$asset_display_object = module$runner$display_object, AssetRequest$$module$runner$asset_display_object = module$asset$asset_request, data$$module$runner$asset_display_object = tools$$module$runner$asset_display_object.descriptorData;
  function AssetDisplayObject$$module$runner$asset_display_object(a, b, c) {
    a && (this._loader = a);
    this._request = null;
    DisplayObject$$module$runner$asset_display_object.call(this);
    c && this.bindAssetCallback(c)
  }
  var proto$$module$runner$asset_display_object = AssetDisplayObject$$module$runner$asset_display_object.prototype = Object.create(DisplayObject$$module$runner$asset_display_object.prototype);
  proto$$module$runner$asset_display_object.request = function(a) {
    if("undefined" === typeof a) {
      return this._request
    }
    this._loader.request(this, this._request = new AssetRequest$$module$runner$asset_display_object(a), this.type);
    return this
  };
  proto$$module$runner$asset_display_object.bindAssetCallback = function(a) {
    function b() {
      d();
      a.call(this, null, this)
    }
    function c(b) {
      d();
      a.call(this, b, this)
    }
    var d = tools$$module$runner$asset_display_object.hitch(this, function() {
      this.removeListener("load", b);
      this.removeListener("error", c)
    });
    this.on("load", b);
    this.on("error", c);
    return this
  };
  module$runner$asset_display_object.module$exports = AssetDisplayObject$$module$runner$asset_display_object;
  module$runner$asset_display_object.module$exports && (module$runner$asset_display_object = module$runner$asset_display_object.module$exports);
  var module$runner$bitmap = {}, AssetDisplayObject$$module$runner$bitmap = module$runner$asset_display_object, tools$$module$runner$bitmap = module$tools, data$$module$runner$bitmap = tools$$module$runner$bitmap.descriptorData, accessor$$module$runner$bitmap = tools$$module$runner$bitmap.descriptorAccessor, getSource$$module$runner$bitmap = tools$$module$runner$bitmap.getter("_source");
  function setSource$$module$runner$bitmap(a) {
    this._source = a;
    this._owner.request(a)
  }
  function Bitmap$$module$runner$bitmap(a, b, c) {
    AssetDisplayObject$$module$runner$bitmap.call(this, a, b, c);
    this.type = "Bitmap";
    Object.defineProperties(this._attributes, {height:data$$module$runner$bitmap(null, !0, !0), width:data$$module$runner$bitmap(null, !0, !0), _naturalWidth:data$$module$runner$bitmap(0, !0, !0), _naturalHeight:data$$module$runner$bitmap(0, !0, !0), source:accessor$$module$runner$bitmap(getSource$$module$runner$bitmap, setSource$$module$runner$bitmap, !0), _source:data$$module$runner$bitmap("", !0, !0), _absoluteUrl:data$$module$runner$bitmap("", !0, !0)});
    a = this._renderAttributes;
    a.height = "height";
    a.width = "width";
    a.naturalHeight = "_naturalHeight";
    a.naturalWidth = "_naturalWidth";
    a.absoluteUrl = "_absoluteUrl";
    this.attr("source", b)
  }
  var parentPrototype$$module$runner$bitmap = AssetDisplayObject$$module$runner$bitmap.prototype, parentPrototypeRequest$$module$runner$bitmap = parentPrototype$$module$runner$bitmap.request, proto$$module$runner$bitmap = Bitmap$$module$runner$bitmap.prototype = Object.create(parentPrototype$$module$runner$bitmap);
  proto$$module$runner$bitmap.clone = function() {
    return new Bitmap$$module$runner$bitmap(this._loader, this.attr("source"))
  };
  proto$$module$runner$bitmap.request = function(a) {
    if("undefined" === typeof a) {
      return this._request
    }
    parentPrototypeRequest$$module$runner$bitmap.call(this, a);
    this._attributes._absoluteUrl = this._request.resources[0].src;
    return this
  };
  proto$$module$runner$bitmap.notify = function(a, b) {
    switch(a) {
      case "load":
        this._attributes._naturalWidth = b.width;
        this._attributes._naturalHeight = b.height;
        this._mutatedAttributes.naturalWidth = !0;
        this._mutatedAttributes.naturalHeight = !0;
        this._mutatedAttributes.absoluteUrl = !0;
        this.emitAsync("load", this);
        this.markUpdate();
        break;
      case "error":
        this.emitAsync("error", Error(b.error), this)
    }
    return this
  };
  proto$$module$runner$bitmap.getComputed = function(a) {
    var b, c = "size" === a && {top:0, right:0, bottom:0, left:0}, d = this._attributes._naturalWidth, e = this._attributes._naturalHeight, f = this.attr("width"), g = this.attr("height"), h = d / e, d = f || (null != g ? h * g : d) || 0, e = g || (null != f ? f / h : e) || 0;
    "width" === a || "right" === a ? b = d : c && (c.right = c.width = d);
    "height" === a || "bottom" === a ? b = e : c && (c.bottom = c.height = e);
    if("top" === a || "left" === a) {
      b = 0
    }
    return c || b
  };
  module$runner$bitmap.module$exports = Bitmap$$module$runner$bitmap;
  module$runner$bitmap.module$exports && (module$runner$bitmap = module$runner$bitmap.module$exports);
  var module$runner$font_family = {}, tools$$module$runner$font_family = module$tools, AssetRequest$$module$runner$font_family = module$asset$asset_request, eventEmitter$$module$runner$font_family = module$event_emitter, uid$$module$runner$font_family = 0;
  function FontFamily$$module$runner$font_family(a, b, c) {
    Object.defineProperty(this, "id", {value:"font_" + uid$$module$runner$font_family++});
    this._loader = a;
    this.fontId = b;
    this.resources = c;
    this._load()
  }
  var proto$$module$runner$font_family = FontFamily$$module$runner$font_family.prototype = Object.create(eventEmitter$$module$runner$font_family);
  proto$$module$runner$font_family._load = function() {
    this._loader.request(this, new AssetRequest$$module$runner$font_family({id:this.fontId, resources:this.resources}), "Font")
  };
  proto$$module$runner$font_family.notify = function(a, b) {
    switch(a) {
      case "load":
        this.emitAsync("load", this);
        break;
      case "error":
        this.emitAsync("error", Error(b.error), this)
    }
    return this
  };
  module$runner$font_family.module$exports = FontFamily$$module$runner$font_family;
  module$runner$font_family.module$exports && (module$runner$font_family = module$runner$font_family.module$exports);
  var module$runner$movie = {}, AssetDisplayObject$$module$runner$movie = module$runner$asset_display_object, DisplayList$$module$runner$movie = module$runner$display_list, Timeline$$module$runner$movie = module$runner$timeline, tools$$module$runner$movie = module$tools;
  function Movie$$module$runner$movie(a, b, c) {
    AssetDisplayObject$$module$runner$movie.call(this, null, b, c);
    this.root = a;
    this._children = [];
    var d = this;
    b && a.loadSubMovie(b, function(a) {
      a ? d.emitAsync("error", a, d) : d.emitAsync("load", d)
    }, this)
  }
  var proto$$module$runner$movie = Movie$$module$runner$movie.prototype = tools$$module$runner$movie.mixin(Object.create(AssetDisplayObject$$module$runner$movie.prototype), Timeline$$module$runner$movie, DisplayList$$module$runner$movie);
  proto$$module$runner$movie.loadSubMovie = function() {
    return this.root.loadSubMovie.apply(this.root, arguments)
  };
  proto$$module$runner$movie.type = "Movie";
  module$runner$movie.module$exports = Movie$$module$runner$movie;
  module$runner$movie.module$exports && (module$runner$movie = module$runner$movie.module$exports);
  var module$runner$path$path = {}, Point$$module$runner$path$path = module$point, CurvedPath$$module$runner$path$path = module$runner$path$curved_path, SegmentHelper$$module$runner$path$path = module$segment_helper, DisplayObject$$module$runner$path$path = module$runner$display_object, tools$$module$runner$path$path = module$tools, color$$module$runner$path$path = module$color, gradient$$module$runner$path$path = module$runner$gradient, Bitmap$$module$runner$path$path = module$runner$bitmap, accessor$$module$runner$path$path = 
  tools$$module$runner$path$path.descriptorAccessor, data$$module$runner$path$path = tools$$module$runner$path$path.descriptorData, getter$$module$runner$path$path = tools$$module$runner$path$path.getter, isArray$$module$runner$path$path = tools$$module$runner$path$path.isArray, parseColor$$module$runner$path$path = color$$module$runner$path$path.parse, exportToPath$$module$runner$path$path = SegmentHelper$$module$runner$path$path.exportToPath, validTokens$$module$runner$path$path = SegmentHelper$$module$runner$path$path.validTokens, 
  parsePath$$module$runner$path$path = SegmentHelper$$module$runner$path$path.parsePath, parseCommandList$$module$runner$path$path = SegmentHelper$$module$runner$path$path.parseCommandList, abs$$module$runner$path$path = Math.abs, cos$$module$runner$path$path = Math.cos, pow$$module$runner$path$path = Math.pow, PI$$module$runner$path$path = Math.PI, PI2$$module$runner$path$path = 2 * PI$$module$runner$path$path, sin$$module$runner$path$path = Math.sin, sqrt$$module$runner$path$path = Math.sqrt;
  function getFillColor$$module$runner$path$path() {
    return this._fillColor
  }
  function setFillColor$$module$runner$path$path(a) {
    this._fillColor = parseColor$$module$runner$path$path(a, this._fillColor)
  }
  function getFillGradient$$module$runner$path$path() {
    return this._fillGradient
  }
  function setFillGradient$$module$runner$path$path(a) {
    this._fillGradient = a ? gradient$$module$runner$path$path(a) : null
  }
  function getFillImage$$module$runner$path$path() {
    return this._fillImage
  }
  function setFillImage$$module$runner$path$path(a) {
    var b = this._owner;
    b._mutatedAttributes.fillImageId = !0;
    if(a) {
      if(!(a instanceof Bitmap$$module$runner$path$path)) {
        throw Error("img is not instance of Bitmap.");
      }
      b.stage && DisplayObject$$module$runner$path$path.registerOffStageObj(b, a, b.stage, "fillImage");
      this._fillImageId = a.id;
      this._fillImage = a
    }else {
      this._fillImage && DisplayObject$$module$runner$path$path.unregisterOffStageObj(b, this._fillImage), this._fillImageId = this._fillImage = null
    }
  }
  function getFillRepeat$$module$runner$path$path() {
    return this._fillRepeat
  }
  function setFillRepeat$$module$runner$path$path(a) {
    var b = tools$$module$runner$path$path.isArray(a);
    a || (a = 1);
    if(b && !isNaN(a[0]) && !isNaN(a[1]) || !isNaN(a)) {
      this._fillRepeat = b ? a : [a, a]
    }else {
      throw Error("repeat argument must be a number or an array [n, n].");
    }
  }
  var getStrokeColor$$module$runner$path$path = getter$$module$runner$path$path("_strokeColor");
  function setStrokeColor$$module$runner$path$path(a) {
    this._strokeColor = parseColor$$module$runner$path$path(a, this._strokeColor)
  }
  function getStrokeGradient$$module$runner$path$path() {
    return this._strokeGradient
  }
  function setStrokeGradient$$module$runner$path$path(a) {
    this._strokeGradient = a ? gradient$$module$runner$path$path(a) : null
  }
  var getCap$$module$runner$path$path = getter$$module$runner$path$path("_cap");
  function setCap$$module$runner$path$path(a) {
    if("butt" === a || "round" === a || "square" === a) {
      this._cap = "" + a
    }
  }
  var getJoin$$module$runner$path$path = getter$$module$runner$path$path("_join");
  function setJoin$$module$runner$path$path(a) {
    if("miter" === a || "round" === a || "bevel" === a) {
      this._join = "" + a
    }
  }
  var getMiterLimit$$module$runner$path$path = getter$$module$runner$path$path("_miterLimit");
  function setMiterLimit$$module$runner$path$path(a) {
    1 <= a && (this._miterLimit = +a)
  }
  function getSegments$$module$runner$path$path() {
    return this._owner._segments
  }
  function setSegments$$module$runner$path$path(a) {
    this._owner._segments = a;
    this._owner.markUpdate("shapeData")
  }
  function Path$$module$runner$path$path(a) {
    DisplayObject$$module$runner$path$path.call(this);
    Object.defineProperties(this._attributes, {_cap:data$$module$runner$path$path("butt", !0), cap:accessor$$module$runner$path$path(getCap$$module$runner$path$path, setCap$$module$runner$path$path, !0), _fillColor:data$$module$runner$path$path(0, !0), fillColor:accessor$$module$runner$path$path(getFillColor$$module$runner$path$path, setFillColor$$module$runner$path$path, !0), _fillGradient:data$$module$runner$path$path(void 0, !0), fillGradient:accessor$$module$runner$path$path(getFillGradient$$module$runner$path$path, 
    setFillGradient$$module$runner$path$path, !0), _fillImage:data$$module$runner$path$path(null, !0), _fillImageId:data$$module$runner$path$path(null, !0), fillImage:accessor$$module$runner$path$path(getFillImage$$module$runner$path$path, setFillImage$$module$runner$path$path, !0), _fillRepeat:data$$module$runner$path$path([1, 1], !0), fillRepeat:accessor$$module$runner$path$path(getFillRepeat$$module$runner$path$path, setFillRepeat$$module$runner$path$path, !0), fillOpacity:data$$module$runner$path$path(1, 
    !0, !0), strokeOpacity:data$$module$runner$path$path(1, !0, !0), _join:data$$module$runner$path$path("miter", !0), join:accessor$$module$runner$path$path(getJoin$$module$runner$path$path, setJoin$$module$runner$path$path, !0), _strokeColor:data$$module$runner$path$path(255, !0), strokeColor:accessor$$module$runner$path$path(getStrokeColor$$module$runner$path$path, setStrokeColor$$module$runner$path$path, !0), _strokeGradient:data$$module$runner$path$path(void 0, !0), strokeGradient:accessor$$module$runner$path$path(getStrokeGradient$$module$runner$path$path, 
    setStrokeGradient$$module$runner$path$path, !0), strokeWidth:data$$module$runner$path$path(0, !0, !0), _miterLimit:data$$module$runner$path$path(4, !0), miterLimit:accessor$$module$runner$path$path(getMiterLimit$$module$runner$path$path, setMiterLimit$$module$runner$path$path, !0), segments:accessor$$module$runner$path$path(getSegments$$module$runner$path$path, setSegments$$module$runner$path$path, !0)});
    var b = this._renderAttributes;
    b.cap = "_cap";
    b.fillColor = "_fillColor";
    b.strokeColor = "_strokeColor";
    b.strokeGradient = "_strokeGradient";
    b.fillGradient = "_fillGradient";
    b.fillImageId = "_fillImageId";
    b.fillRepeat = "_fillRepeat";
    b.fillOpacity = "fillOpacity";
    b.strokeOpacity = "strokeOpacity";
    b.join = "_join";
    b.strokeWidth = "strokeWidth";
    b.miterLimit = "_miterLimit";
    this.morphableAttributes = {x:1, y:1, segments:1, fillColor:1, strokeColor:1, strokeWidth:1, fillOpacity:1, strokeOpacity:1, opacity:1, fillGradient:1, scale:1, scaleX:1, scaleY:1, rotation:1, filters:1};
    this._segments = [];
    this._curve = new CurvedPath$$module$runner$path$path;
    this._mutatedAttributes = tools$$module$runner$path$path.mixin({}, this._renderAttributes);
    if(a) {
      b = isArray$$module$runner$path$path(a) ? isArray$$module$runner$path$path(a[0]) ? a[0][0] : a[0] : a;
      if(-1 != validTokens$$module$runner$path$path.indexOf(b)) {
        return this.segments.apply(this, arguments)
      }
      if("number" == typeof b) {
        return this.points.apply(this, arguments)
      }
      if("string" == typeof a) {
        return this.path(a)
      }
      throw TypeError('Expected array of segments or points, or SVG path string. Got "' + a + " instead.");
    }
  }
  var superObject$$module$runner$path$path = DisplayObject$$module$runner$path$path.prototype, proto$$module$runner$path$path = Path$$module$runner$path$path.prototype = Object.create(superObject$$module$runner$path$path);
  proto$$module$runner$path$path._activate = function(a) {
    var b = superObject$$module$runner$path$path._activate.apply(this, arguments), c = this._attributes._fillImage;
    c && DisplayObject$$module$runner$path$path.registerOffStageObj(this, c, a, "fillImage");
    this.markUpdate("shapeData");
    return b
  };
  proto$$module$runner$path$path.markUpdate = function(a) {
    "shapeData" === a && (this._isPathDataMutated = !0);
    return superObject$$module$runner$path$path.markUpdate.call(this)
  };
  proto$$module$runner$path$path.clone = function(a) {
    for(var b = -1, c = this._segments, d = c.length, e = Array(d), f = new Path$$module$runner$path$path;++b < d;) {
      e[b] = c[b].slice()
    }
    a && a.attributes && f.attr(this.attr());
    return f.segments(e)
  };
  proto$$module$runner$path$path.segments = function(a) {
    if(0 === arguments.length) {
      return this._segments.slice().map(function(a) {
        return a.slice()
      })
    }
    if(isArray$$module$runner$path$path(a)) {
      if(isArray$$module$runner$path$path(a[0])) {
        var b = a.concat, a = b.call.apply(b, a)
      }
    }else {
      if("string" == typeof a) {
        a = arguments
      }else {
        throw new TypeError("Invalid parameter: " + a);
      }
    }
    this._segments = parseCommandList$$module$runner$path$path(a);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.points = function(a) {
    if("undefined" == typeof a) {
      return this._segments.map(function(a) {
        return a.slice(-2)
      }).filter(Boolean)
    }
    for(var a = isArray$$module$runner$path$path(a) ? a : arguments, b = 0, c, d, e = a.length;b < e;b += 2) {
      c = a[b], d = a[b + 1], b ? this.lineTo(c, d) : this.clear().moveTo(c, d)
    }
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.path = function(a) {
    var b = this._segments;
    if("undefined" == typeof a) {
      return exportToPath$$module$runner$path$path(b)
    }
    if("string" == typeof a) {
      return this._segments = parsePath$$module$runner$path$path(a), this.markUpdate("shapeData"), this
    }
    throw new TypeError("Invalid parameter: " + a);
  };
  proto$$module$runner$path$path.moveTo = function(a, b) {
    if(!isFinite(a) || !isFinite(b)) {
      throw TypeError("moveTo needs two finite arguments");
    }
    this._segments.push(["moveTo", a, b]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.moveBy = function(a, b) {
    if(!isFinite(a) || !isFinite(b)) {
      throw TypeError("moveBy needs two finite arguments");
    }
    this._segments.push(["moveBy", a, b]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.closePath = function() {
    this._segments.push(["closePath"]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.lineTo = function(a, b) {
    if(!isFinite(a) || !isFinite(b)) {
      throw TypeError("lineTo needs two finite arguments");
    }
    this._segments.push(["lineTo", a, b]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.lineBy = function(a, b) {
    if(!isFinite(a) || !isFinite(b)) {
      throw TypeError("lineBy needs two finite arguments");
    }
    this._segments.push(["lineBy", a, b]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.verticalLineTo = function(a) {
    return this.lineTo(this.lastPoint()[0], a)
  };
  proto$$module$runner$path$path.verticalLineBy = function(a) {
    return this.lineBy(0, a)
  };
  proto$$module$runner$path$path.horizontalLineTo = function(a) {
    var b = this.lastPoint();
    return this.lineTo(a, b[1])
  };
  proto$$module$runner$path$path.horizontalLineBy = function(a) {
    return this.lineBy(a, 0)
  };
  proto$$module$runner$path$path.curveTo = function(a, b, c, d, e, f) {
    if(6 > arguments.length) {
      throw Error("Incorrect number of arguments.");
    }
    this._segments.push(["curveTo", a, b, c, d, e, f]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.curveBy = function(a, b, c, d, e, f) {
    if(6 > arguments.length) {
      throw Error("Incorrect number of arguments.");
    }
    this._segments.push(["curveBy", a, b, c, d, e, f]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.quadraticCurveTo = function(a, b, c, d) {
    if(4 > arguments.length) {
      throw Error("quadraticCurveTo needs 4 arguments");
    }
    this._segments.push(["quadraticCurveTo", a, b, c, d]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.quadraticCurveBy = function(a, b, c, d) {
    if(4 > arguments.length) {
      throw Error("quadraticCurveBy needs 4 arguments");
    }
    this._segments.push(["quadraticCurveBy", a, b, c, d]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.arcTo = function(a, b, c, d, e, f, g) {
    this._segments.push(["arcTo", a, b, c, d, e, f, g]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.arcBy = function(a, b, c, d, e, f, g) {
    this._segments.push(["arcBy", a, b, c, d, e, f, g]);
    this.markUpdate("shapeData");
    return this
  };
  proto$$module$runner$path$path.arc = function(a, b, c, d, e, f) {
    var f = !!f, g;
    g = f ? e : d;
    f = f ? PI2$$module$runner$path$path - d : e;
    e = abs$$module$runner$path$path(f - g);
    d = a + c * cos$$module$runner$path$path(g);
    g = b + c * sin$$module$runner$path$path(g);
    e < PI2$$module$runner$path$path ? (a += c * cos$$module$runner$path$path(f), b += c * sin$$module$runner$path$path(f)) : (a = d, b = g - 1.0E-4);
    return this[this._segments.length ? "lineTo" : "moveTo"](d, g).arcTo(c, c, 0, e < PI$$module$runner$path$path ? 0 : 1, 1, a, b)
  };
  proto$$module$runner$path$path.boundingBox = function() {
    throw"Not implemented";
  };
  proto$$module$runner$path$path.pointAtLength = function() {
    throw"Not implemented";
  };
  proto$$module$runner$path$path.clear = function() {
    this._segments.length = 0;
    this._curve.clear();
    return this
  };
  proto$$module$runner$path$path.fill = function(a) {
    if("string" === typeof a || "number" === typeof a || a instanceof color$$module$runner$path$path.RGBAColor) {
      return this.attr("fillColor", a)
    }
    if(a instanceof gradient$$module$runner$path$path.LinearGradient || a instanceof gradient$$module$runner$path$path.RadialGradient) {
      return this.attr("fillGradient", a)
    }
    if(a instanceof Bitmap$$module$runner$path$path) {
      return this.attr("fillImage", a)
    }
    throw Error('A fill of "' + a + '" is not supported');
  };
  proto$$module$runner$path$path.stroke = function(a, b) {
    b && this.attr("strokeWidth", b);
    if("string" === typeof a || "number" === typeof a || a instanceof color$$module$runner$path$path.RGBAColor) {
      return this.attr("strokeColor", a)
    }
    if(a instanceof gradient$$module$runner$path$path.LinearGradient || a instanceof gradient$$module$runner$path$path.RadialGradient) {
      return this.attr("strokeGradient", a)
    }
    throw Error('A fill of "' + fill + '" is not supported');
  };
  proto$$module$runner$path$path.lastSegment = function() {
    var a = this._segments.slice(-1);
    if("undefined" != typeof a[0]) {
      return a
    }
  };
  proto$$module$runner$path$path.lastPoint = function() {
    var a, b, c, d, e, f, g, h = 0, j = 0, i = !1;
    a = this._segments.slice(-1)[0];
    if(/To/.test(a[0])) {
      return a.slice(-2)
    }
    f = this._segments;
    for(g = f.length;0 < g--;) {
      a = f[g];
      b = a[0];
      c = a.length;
      d = i ? /moveTo/ : /To/;
      e = i ? /moveBy/ : /By/;
      if(d.test(b)) {
        return[a[c - 2] + h, a[c - 1] + j]
      }
      /close/.test(b) ? i = !0 : e.test(b) && (h += a[c - 2], j += a[c - 1])
    }
    throw Error("Could not find a point.");
  };
  proto$$module$runner$path$path.type = "Path";
  proto$$module$runner$path$path._getRenderData = function() {
    if(this._isPathDataMutated) {
      for(var a, b, c, d = [], e = this._segments, f = 0, g = e.length;f < g;f++) {
        b = e[f];
        c = [];
        for(var h = 0, j = b.length;h < j;h++) {
          a = b[h], c.push(h && a instanceof Point$$module$runner$path$path ? [a.x, a.y] : a)
        }
        d.push(c)
      }
      this._isPathDataMutated = !1;
      return d
    }
  };
  proto$$module$runner$path$path.toCurves = function(a) {
    this._segments = CurvedPath$$module$runner$path$path.toCurves(this._segments, a)
  };
  proto$$module$runner$path$path.morphTo = function(a, b, c) {
    this.toCurves();
    a.toCurves();
    var d = CurvedPath$$module$runner$path$path.countSubPaths(this._segments), e = CurvedPath$$module$runner$path$path.countSubPaths(a._segments), f = d.length > e.length, g = f ? e : d, d = (f ? d : e).map(function(a, b) {
      return g[b] > a ? g[b] : a
    });
    this.toCurves(d);
    a.toCurves(d);
    var a = a.attr(), h;
    for(h in a) {
      (null == a[h] || !(h in this.morphableAttributes)) && delete a[h]
    }
    return this.animate(b, a, c)
  };
  proto$$module$runner$path$path.morphSegmentsTo = function(a, b, c) {
    this.toCurves();
    a.toCurves();
    var d = Math.max(a._segments.length, this._segments.length);
    this.toCurves(d);
    a.toCurves(d);
    return this.animate(b, {segments:a.attr("segments")}, c)
  };
  Path$$module$runner$path$path.toAbsolute = function(a) {
    var b = a && a.length;
    if(!b) {
      return[["moveTo", 0, 0]]
    }
    var c = 0, d = 0, e = [], f = 0, g = 0, h = 0;
    "moveTo" == a[0][0] && (g = a[0][1], h = a[0][2], c = g, d = h, f++, e[0] = ["moveTo", g, h]);
    for(var j, i, k, l = f;l < b;l++) {
      e.push(f = []);
      j = a[l];
      k = j.length;
      i = j[0];
      if(/By/.test(i)) {
        switch(f[0] = i.replace(/By/, "To"), i) {
          case "arcBy":
            f[1] = j[1];
            f[2] = j[2];
            f[3] = j[3];
            f[4] = j[4];
            f[5] = j[5];
            f[6] = j[6] + g;
            f[7] = j[7] + h;
            break;
          case "verticalLineBy":
            f[1] = j[1] + h;
            break;
          case "horizontalLineBy":
            f[1] = j[1] + g;
            break;
          case "moveBy":
            c = j[1] + g, d = j[2] + h;
          default:
            for(i = 1;i < k;i++) {
              f[i] = j[i] + (i % 2 ? g : h)
            }
        }
      }else {
        for(i = 0;i < k;i++) {
          f[i] = j[i]
        }
      }
      switch(f[0]) {
        case "closePath":
          g = c;
          h = d;
          break;
        case "horizontalLineTo":
          g = f[1];
          break;
        case "verticalLineTo":
          h = f[1];
          break;
        case "moveTo":
          c = f[f.length - 2], d = f[f.length - 1];
        default:
          g = f[f.length - 2], h = f[f.length - 1]
      }
    }
    return e
  };
  proto$$module$runner$path$path.getComputed = function(a) {
    for(var b = {top:0, right:0, bottom:0, left:0, width:0, height:0}, c = CurvedPath$$module$runner$path$path.toCurves(this.attr("segments").slice()), d = !0, e = Math.max, f = Math.min, g = 0, h;h = c[g];g += 1) {
      if("closePath" !== h[0]) {
        for(var j = 1, i = h.length;j < i;j += 2) {
          var k = h[j], l = h[j + 1];
          b.top = d ? l : f(b.top, l);
          b.right = d ? k : e(b.right, k);
          b.bottom = d ? l : e(b.bottom, l);
          b.left = d ? k : f(b.left, k);
          d = !1
        }
      }
    }
    k = this.attr("x");
    l = this.attr("y");
    b.top += l;
    b.right += k;
    b.bottom += l;
    b.left += k;
    b.width = b.right - b.left;
    b.height = b.bottom - b.top;
    return"size" === a ? b : b[a]
  };
  module$runner$path$path.module$exports = Path$$module$runner$path$path;
  module$runner$path$path.module$exports && (module$runner$path$path = module$runner$path$path.module$exports);
  var module$runner$path$special_attr_path = {}, Path$$module$runner$path$special_attr_path = module$runner$path$path, tools$$module$runner$path$special_attr_path = module$tools;
  function makeAccessor$$module$runner$path$special_attr_path(a, b) {
    var c = b;
    return tools$$module$runner$path$special_attr_path.descriptorAccessor(function() {
      return c
    }, function(a) {
      c = a;
      this._owner._isProcessingPathAttribute || (this._owner._isProcessingPathAttribute = !0, this._owner.clear(), this._owner._make(), this._owner._isProcessingPathAttribute = !1)
    }, !0)
  }
  function SpecialAttrPath$$module$runner$path$special_attr_path(a) {
    Path$$module$runner$path$special_attr_path.call(this);
    this._isProcessingPathAttribute = !1;
    for(var b in a) {
      Object.defineProperty(this._attributes, b, makeAccessor$$module$runner$path$special_attr_path(b, a[b]))
    }
  }
  var proto$$module$runner$path$special_attr_path = SpecialAttrPath$$module$runner$path$special_attr_path.prototype = Object.create(Path$$module$runner$path$special_attr_path.prototype), attrMethod$$module$runner$path$special_attr_path = Path$$module$runner$path$special_attr_path.prototype.attr;
  proto$$module$runner$path$special_attr_path.attr = function(a, b) {
    var c = arguments.length;
    return!this._isProcessingPathAttribute && 1 === c && "string" !== typeof a ? (this._isProcessingPathAttribute = !0, attrMethod$$module$runner$path$special_attr_path.call(this, a), this.clear(), this._make(), this._isProcessingPathAttribute = !1, this) : attrMethod$$module$runner$path$special_attr_path.apply(this, arguments)
  };
  proto$$module$runner$path$special_attr_path.morphTo = function() {
    throw Error("SpecialAttrPath's are not morphable");
  };
  proto$$module$runner$path$special_attr_path._make = function() {
  };
  module$runner$path$special_attr_path.module$exports = SpecialAttrPath$$module$runner$path$special_attr_path;
  module$runner$path$special_attr_path.module$exports && (module$runner$path$special_attr_path = module$runner$path$special_attr_path.module$exports);
  var module$runner$path$arc = {}, Path$$module$runner$path$arc = module$runner$path$path, SpecialAttrPath$$module$runner$path$arc = module$runner$path$special_attr_path, tools$$module$runner$path$arc = module$tools;
  Path$$module$runner$path$arc.arc = function(a, b, c, d, e, f) {
    return(new Path$$module$runner$path$arc((new Arc$$module$runner$path$arc(a, b, c, d, e, f)).segments())).attr({x:a, y:b})
  };
  var PI$$module$runner$path$arc = Math.PI, PI2$$module$runner$path$arc = 2 * PI$$module$runner$path$arc, sin$$module$runner$path$arc = Math.sin, cos$$module$runner$path$arc = Math.cos, abs$$module$runner$path$arc = Math.abs;
  function Arc$$module$runner$path$arc(a, b, c, d, e, f) {
    SpecialAttrPath$$module$runner$path$arc.call(this, {radius:0, startAngle:0, endAngle:0, antiClockwise:!1});
    this.attr({x:a, y:b, radius:c, startAngle:d, endAngle:e, antiClockwise:f})
  }
  var proto$$module$runner$path$arc = Arc$$module$runner$path$arc.prototype = Object.create(SpecialAttrPath$$module$runner$path$arc.prototype);
  proto$$module$runner$path$arc._make = function() {
    var a = this._attributes, b = a.radius, c = a.startAngle, d = a.endAngle, e = a.antiClockwise, e = !!e, f, a = e ? d : c;
    f = e ? PI2$$module$runner$path$arc - c : d;
    d = abs$$module$runner$path$arc(f - a);
    c = b * cos$$module$runner$path$arc(a);
    a = b * sin$$module$runner$path$arc(a);
    d < PI2$$module$runner$path$arc ? (e = b * cos$$module$runner$path$arc(f), f = b * sin$$module$runner$path$arc(f)) : (e = c, f = a - 1.0E-4);
    return this.moveTo(c, a).arcTo(b, b, 0, d < PI$$module$runner$path$arc ? 0 : 1, 1, e, f)
  };
  module$runner$path$arc.module$exports = Arc$$module$runner$path$arc;
  module$runner$path$arc.module$exports && (module$runner$path$arc = module$runner$path$arc.module$exports);
  var module$runner$path$circle = {}, Path$$module$runner$path$circle = module$runner$path$path, SpecialAttrPath$$module$runner$path$circle = module$runner$path$special_attr_path, tools$$module$runner$path$circle = module$tools;
  Path$$module$runner$path$circle.circle = function(a, b, c) {
    return(new Path$$module$runner$path$circle((new Circle$$module$runner$path$circle(a, b, c)).segments())).attr({x:a, y:b})
  };
  function Circle$$module$runner$path$circle(a, b, c) {
    SpecialAttrPath$$module$runner$path$circle.call(this, {radius:0});
    this.attr({x:a, y:b, radius:c})
  }
  var proto$$module$runner$path$circle = Circle$$module$runner$path$circle.prototype = Object.create(SpecialAttrPath$$module$runner$path$circle.prototype);
  proto$$module$runner$path$circle._make = function() {
    var a = this._attributes.radius;
    this.moveTo(a, 0).arcTo(a, a, 0, 0, 0, -a, 0).arcTo(a, a, 0, 0, 0, a, 0)
  };
  module$runner$path$circle.module$exports = Circle$$module$runner$path$circle;
  module$runner$path$circle.module$exports && (module$runner$path$circle = module$runner$path$circle.module$exports);
  var module$runner$path$ellipse = {}, Path$$module$runner$path$ellipse = module$runner$path$path, SpecialAttrPath$$module$runner$path$ellipse = module$runner$path$special_attr_path, tools$$module$runner$path$ellipse = module$tools;
  Path$$module$runner$path$ellipse.ellipse = function(a, b, c, d) {
    return(new Path$$module$runner$path$ellipse((new Ellipse$$module$runner$path$ellipse(a, b, c, d)).segments())).attr({x:a, y:b})
  };
  function Ellipse$$module$runner$path$ellipse(a, b, c, d) {
    SpecialAttrPath$$module$runner$path$ellipse.call(this, {radiusX:0, radiusY:0});
    this.attr({x:a, y:b, radiusX:c, radiusY:d})
  }
  var proto$$module$runner$path$ellipse = Ellipse$$module$runner$path$ellipse.prototype = Object.create(SpecialAttrPath$$module$runner$path$ellipse.prototype);
  proto$$module$runner$path$ellipse._make = function() {
    var a = this._attributes, b = a.radiusX, a = a.radiusY;
    this.moveTo(b, 0).arcTo(b, a, 0, 0, 0, -b, 0).arcTo(b, a, 0, 0, 0, b, 0)
  };
  module$runner$path$ellipse.module$exports = Ellipse$$module$runner$path$ellipse;
  module$runner$path$ellipse.module$exports && (module$runner$path$ellipse = module$runner$path$ellipse.module$exports);
  var module$runner$path$polygon = {}, Path$$module$runner$path$polygon = module$runner$path$path, SpecialAttrPath$$module$runner$path$polygon = module$runner$path$special_attr_path, tools$$module$runner$path$polygon = module$tools;
  Path$$module$runner$path$polygon.polygon = function(a, b, c, d) {
    return(new Path$$module$runner$path$polygon((new Polygon$$module$runner$path$polygon(a, b, c, d)).segments())).attr({x:a, y:b})
  };
  var PI2$$module$runner$path$polygon = 2 * Math.PI, sin$$module$runner$path$polygon = Math.sin, cos$$module$runner$path$polygon = Math.cos;
  function Polygon$$module$runner$path$polygon(a, b, c, d) {
    SpecialAttrPath$$module$runner$path$polygon.call(this, {radius:0, sides:3});
    this.attr({x:a, y:b, sides:d, radius:c})
  }
  var proto$$module$runner$path$polygon = Polygon$$module$runner$path$polygon.prototype = Object.create(SpecialAttrPath$$module$runner$path$polygon.prototype);
  proto$$module$runner$path$polygon._make = function() {
    var a = this._attributes, b = a.x, c = a.y, d = a.sides, a = a.radius;
    if(!(3 <= d)) {
      throw RangeError("A polygon needs at least 3 sides.");
    }
    d >>>= 0;
    this.attr({x:b, y:c});
    this.moveTo(0, -a);
    for(b = 1;b < d;b++) {
      c = PI2$$module$runner$path$polygon * b / d, this.lineTo(sin$$module$runner$path$polygon(c) * a, -cos$$module$runner$path$polygon(c) * a)
    }
    this.closePath()
  };
  module$runner$path$polygon.module$exports = Polygon$$module$runner$path$polygon;
  module$runner$path$polygon.module$exports && (module$runner$path$polygon = module$runner$path$polygon.module$exports);
  var module$runner$path$rect = {}, Path$$module$runner$path$rect = module$runner$path$path, SpecialAttrPath$$module$runner$path$rect = module$runner$path$special_attr_path, tools$$module$runner$path$rect = module$tools;
  Path$$module$runner$path$rect.rect = function(a, b, c, d, e) {
    return(new Path$$module$runner$path$rect((new Rect$$module$runner$path$rect(a, b, c, d, e)).segments())).attr({x:a, y:b})
  };
  function Rect$$module$runner$path$rect(a, b, c, d, e) {
    SpecialAttrPath$$module$runner$path$rect.call(this, {height:0, width:0, cornerRadius:0});
    this.attr({x:a, y:b, width:c, height:d, cornerRadius:e, origin:{x:c / 2, y:d / 2}})
  }
  var proto$$module$runner$path$rect = Rect$$module$runner$path$rect.prototype = Object.create(SpecialAttrPath$$module$runner$path$rect.prototype);
  proto$$module$runner$path$rect._make = function() {
    var a = this._attributes, b = a.width, c = a.height, d = a.cornerRadius, e, f;
    d ? (e = d[0] || d, f = d[1] || d, a = d[2] || d, d = d[3] || d, this.moveTo(0, e).arcBy(e, e, 0, 0, 1, e, -e).lineBy(b - e - f, 0).arcBy(f, f, 0, 0, 1, f, f).lineBy(0, c - f - a).arcBy(a, a, 0, 0, 1, -a, a).lineBy(-(b - d - a), 0).arcBy(d, d, 0, 0, 1, -d, -d)) : this.moveTo(0, 0).lineBy(b, 0).lineBy(0, c).lineBy(-b, 0);
    this.closePath()
  };
  module$runner$path$rect.module$exports = Rect$$module$runner$path$rect;
  module$runner$path$rect.module$exports && (module$runner$path$rect = module$runner$path$rect.module$exports);
  var module$runner$path$star = {}, Path$$module$runner$path$star = module$runner$path$path, SpecialAttrPath$$module$runner$path$star = module$runner$path$special_attr_path, Polygon$$module$runner$path$star = module$runner$path$polygon, tools$$module$runner$path$star = module$tools;
  Path$$module$runner$path$star.star = function(a, b, c, d, e) {
    return(new Path$$module$runner$path$star((new Star$$module$runner$path$star(a, b, c, d, e)).segments())).attr({x:a, y:b})
  };
  function Star$$module$runner$path$star(a, b, c, d, e) {
    SpecialAttrPath$$module$runner$path$star.call(this, {radius:0, rays:0, factor:0});
    this.attr({x:a, y:b, radius:c, rays:d, factor:e})
  }
  var proto$$module$runner$path$star = Star$$module$runner$path$star.prototype = Object.create(SpecialAttrPath$$module$runner$path$star.prototype);
  proto$$module$runner$path$star._make = function() {
    var a = this._attributes, b = a.x, c = a.y, d = 0 | a.rays, e = a.factor, a = a.radius;
    if(!(3 <= d)) {
      throw RangeError("A star needs at least 3 rays.");
    }
    this.segments((new Polygon$$module$runner$path$star(b, c, a, d)).segments());
    var b = this.segments(), c = b[0], f, g = [c.slice()];
    if(!(0 <= e || 0 > e)) {
      f = b[d / 2 - 0.5 | 0];
      var e = c[2], h = f[1], j = f[2];
      f = b[1];
      var i = (0 + f[1]) / 2, e = i * h * -a / ((e + f[2]) / 2 * h - i * j + i * e) / i
    }
    for(a = 0;a < d;a++) {
      f = b[(a + 1) % d], g.push(["lineTo", (c[1] + f[1]) / 2 * e, (c[2] + f[2]) / 2 * e], f), c = f
    }
    f[0] = "closePath";
    f.length = 1;
    this.segments(g)
  };
  module$runner$path$star.module$exports = Star$$module$runner$path$star;
  module$runner$path$star.module$exports && (module$runner$path$star = module$runner$path$star.module$exports);
  var module$runner$sprite = {}, Bitmap$$module$runner$sprite = module$runner$bitmap, Group$$module$runner$sprite = module$runner$group, AssetDisplayObject$$module$runner$sprite = module$runner$asset_display_object, tools$$module$runner$sprite = module$tools, data$$module$runner$sprite = tools$$module$runner$sprite.descriptorData;
  function Sprite$$module$runner$sprite(a, b, c) {
    Group$$module$runner$sprite.call(this);
    this._loader = a;
    this._callback = c;
    this.sources = b;
    this.currentBitmapIndex = 0;
    c && AssetDisplayObject$$module$runner$sprite.prototype.bindAssetCallback.call(this, c);
    Object.defineProperties(this._attributes, {height:data$$module$runner$sprite(0, !0, !0), width:data$$module$runner$sprite(0, !0, !0)});
    this._load()
  }
  var proto$$module$runner$sprite = Sprite$$module$runner$sprite.prototype = Object.create(Group$$module$runner$sprite.prototype);
  proto$$module$runner$sprite._load = function() {
    for(var a = this, b = this.sources, c = 0, d = b.length;c < d;++c) {
      new Bitmap$$module$runner$sprite(this._loader, b[c], function(b, c) {
        b ? a.emit("error", c) : a._bitmapLoaded(this)
      })
    }
  };
  proto$$module$runner$sprite._bitmapLoaded = function(a) {
    var b = this._callback;
    this.addChild(a);
    b && this._children.length == this.sources.length && this.emit("load", b)
  };
  module$runner$sprite.module$exports = Sprite$$module$runner$sprite;
  module$runner$sprite.module$exports && (module$runner$sprite = module$runner$sprite.module$exports);
  var module$runner$video = {}, AssetDisplayObject$$module$runner$video = module$runner$asset_display_object, tools$$module$runner$video = module$tools, data$$module$runner$video = tools$$module$runner$video.descriptorData, accessor$$module$runner$video = tools$$module$runner$video.descriptorAccessor, getter$$module$runner$video = tools$$module$runner$video.getter;
  function Video$$module$runner$video(a, b, c, d) {
    d || (d = {});
    AssetDisplayObject$$module$runner$video.call(this, a, b, c);
    this.type = "Video";
    Object.defineProperties(this._attributes, {height:data$$module$runner$video(d.height, !0, !0), width:data$$module$runner$video(d.width, !0, !0), autoplay:data$$module$runner$video(d.autoplay || !1, !0, !0)});
    a = this._renderAttributes;
    a.height = "height";
    a.width = "width";
    a.autoplay = "autoplay";
    this.request(b)
  }
  var parentPrototype$$module$runner$video = AssetDisplayObject$$module$runner$video.prototype, parentPrototypeDestroy$$module$runner$video = parentPrototype$$module$runner$video.destroy, proto$$module$runner$video = Video$$module$runner$video.prototype = Object.create(parentPrototype$$module$runner$video);
  proto$$module$runner$video.clone = function() {
    return new Video$$module$runner$video(this._loader, this._request)
  };
  proto$$module$runner$video.destroy = function() {
    parentPrototypeDestroy$$module$runner$video.call(this);
    this._loader.destroyAsset(this);
    return this
  };
  proto$$module$runner$video.notify = function(a, b) {
    switch(a) {
      case "load":
        this.attr({width:b.width, height:b.height});
        this.emitAsync("load", this);
        break;
      case "error":
        this.emitAsync("error", Error(b.error))
    }
    return this
  };
  proto$$module$runner$video.getComputed = function(a) {
    var b, c = "size" === a && {top:0, right:0, bottom:0, left:0};
    "width" === a || "right" === a ? b = this.attr("width") || 0 : c && (c.right = c.width = this.attr("width") || 0);
    "height" === a || "bottom" === a ? b = this.attr("height") || 0 : c && (c.bottom = c.height = this.attr("height") || 0);
    if("top" === a || "left" === a) {
      b = 0
    }
    return c || b
  };
  module$runner$video.module$exports = Video$$module$runner$video;
  module$runner$video.module$exports && (module$runner$video = module$runner$video.module$exports);
  var module$version = {module$exports:"0.3.4-pre"};
  module$version.module$exports && (module$version = module$version.module$exports);
  var module$bootstrapper$player = {}, RendererController$$module$bootstrapper$player = module$renderer$renderer_controller, AssetController$$module$bootstrapper$player = module$asset$asset_controller, tools$$module$bootstrapper$player = module$tools, URI$$module$bootstrapper$player = module$uri, version$$module$bootstrapper$player = module$version, player$$module$bootstrapper$player = {version:version$$module$bootstrapper$player, AssetController:AssetController$$module$bootstrapper$player, RendererController:RendererController$$module$bootstrapper$player, 
  defaultRunnerOptions:{}, _addDefaultRunnerOptions:function(a) {
    var b = this.defaultRunnerOptions, c;
    for(c in b) {
      c in a || (a[c] = b[c])
    }
  }, _baseUrl:null, baseUrl:function() {
    return this._baseUrl || (this._baseUrl = URI$$module$bootstrapper$player.parse(tools$$module$bootstrapper$player.baseUri(document)))
  }, createRenderer:function(a, b, c, d) {
    d || (d = {});
    this._addDefaultRunnerOptions(d);
    var e = this.baseUrl();
    d.baseUrl = "baseUrl" in d ? e.resolveUri(d.baseUrl).toString() : e.toString();
    "assetBaseUrl" in d && (d.assetBaseUrl = e.resolveUri(d.assetBaseUrl).toString());
    "url" in d && (d.url = e.resolveUri(d.url).toString());
    tools$$module$bootstrapper$player.isArray(d.urls) && (d.urls = tools$$module$bootstrapper$player.forEach(d.urls, function(a, b, c) {
      c[b] = e.resolveUri(a).toString()
    }));
    var f = new this.RunnerContext(this.runnerUrl, "undefined" === typeof document ? null : document, d.baseUrl), a = new this.Renderer(a, b, c, d.allowEventDefaults, d.fpsLog), b = new this.AssetController;
    return new this.RendererController(a, b, f, d)
  }, run:function(a, b, c) {
    b && "string" != typeof b ? c = b : (c || (c = {}), c.url = b);
    b = this._getSize(a, c.width, c.height);
    a = this.createRenderer(a, b.width, b.height, c);
    a.initRenderer();
    return a
  }, setup:function(a) {
    "runnerContext" in a && (this.RunnerContext = a.runnerContext);
    "runnerUrl" in a && (this.runnerUrl = a.runnerUrl);
    "baseUrl" in a && (this._baseUrl = URI$$module$bootstrapper$player.parse(a.baseUrl));
    return this
  }, _getSize:function(a, b, c) {
    var d;
    if(!b || !c) {
      a ? (d = a.ownerDocument.defaultView, d = d.getComputedStyle(a, null), b || (b = a.clientWidth - parseInt(d.paddingLeft) - parseInt(d.paddingRight)), c || (c = a.clientWidth - parseInt(d.paddingLeft) - parseInt(d.paddingRight))) : b = c = 0
    }
    return{width:b, height:c}
  }};
  module$bootstrapper$player.module$exports = player$$module$bootstrapper$player;
  module$bootstrapper$player.module$exports && (module$bootstrapper$player = module$bootstrapper$player.module$exports);
  var module$bootstrapper$util = {}, version$$module$bootstrapper$util = module$version;
  function reEscape$$module$bootstrapper$util(a) {
    return a.replace(/[\\^$*+?.()|{}[\]]/g, "\\$1")
  }
  function filter$$module$bootstrapper$util(a, b, c) {
    for(var d, e = [], f = 0, g = a.length;f < g;f += 1) {
      d = a[f], b.call(c, d, f, a) && e.push(d)
    }
    return e
  }
  var reVersion$$module$bootstrapper$util = RegExp("\\b" + reEscape$$module$bootstrapper$util(version$$module$bootstrapper$util) + "\\b"), reTest$$module$bootstrapper$util = RegExp.prototype.test;
  module$bootstrapper$util.module$exports = {chooseRunnerUrl:function(a, b) {
    var a = filter$$module$bootstrapper$util(a, reTest$$module$bootstrapper$util, /(?:^|\/)bonsai.*\.js(?:$|\?|#)/i), c = 0, d = 0, e = filter$$module$bootstrapper$util(a, reTest$$module$bootstrapper$util, reVersion$$module$bootstrapper$util);
    b && (c = filter$$module$bootstrapper$util(a, reTest$$module$bootstrapper$util, b), d = filter$$module$bootstrapper$util(e, reTest$$module$bootstrapper$util, b));
    return d[0] || c[0] || e[0] || a[0]
  }};
  module$bootstrapper$util.module$exports && (module$bootstrapper$util = module$bootstrapper$util.module$exports);
  var module$runner$environment = {}, tools$$module$runner$environment = module$tools, EventEmitter$$module$runner$environment = module$event_emitter, Movie$$module$runner$environment = module$runner$movie, Point$$module$runner$environment = module$point, Path$$module$runner$environment = module$runner$path$path, SpecialAttrPath$$module$runner$environment = module$runner$path$special_attr_path, Rect$$module$runner$environment = module$runner$path$rect, Polygon$$module$runner$environment = module$runner$path$polygon, 
  Star$$module$runner$environment = module$runner$path$star, Ellipse$$module$runner$environment = module$runner$path$ellipse, Circle$$module$runner$environment = module$runner$path$circle, Arc$$module$runner$environment = module$runner$path$arc, Bitmap$$module$runner$environment = module$runner$bitmap, DisplayObject$$module$runner$environment = module$runner$display_object, Group$$module$runner$environment = module$runner$group, Animation$$module$runner$environment = module$runner$animation$animation, 
  KeyframeAnimation$$module$runner$environment = module$runner$animation$keyframe_animation, easing$$module$runner$environment = module$runner$animation$easing, FontFamily$$module$runner$environment = module$runner$font_family, Matrix$$module$runner$environment = module$runner$matrix, Sprite$$module$runner$environment = module$runner$sprite, color$$module$runner$environment = module$color, gradient$$module$runner$environment = module$runner$gradient, Text$$module$runner$environment = module$runner$text, 
  TextSpan$$module$runner$environment = module$runner$text_span, Video$$module$runner$environment = module$runner$video, filter$$module$runner$environment = module$runner$filter$builtin, DOMElement$$module$runner$environment = module$runner$dom_element, version$$module$runner$environment = module$version;
  function bindConstructorToParameters$$module$runner$environment(a, b) {
    function c() {
      b.length = d;
      b.push.apply(b, arguments);
      return a.apply(this, b)
    }
    var d = b.length, b = b.slice();
    c.prototype = a.prototype;
    return c
  }
  function Environment$$module$runner$environment(a, b) {
    var c = this.exports = {DOMElement:DOMElement$$module$runner$environment, DisplayObject:DisplayObject$$module$runner$environment, Group:Group$$module$runner$environment, Matrix:Matrix$$module$runner$environment, Text:Text$$module$runner$environment, TextSpan:TextSpan$$module$runner$environment, Path:Path$$module$runner$environment, SpecialAttrPath:SpecialAttrPath$$module$runner$environment, Rect:Rect$$module$runner$environment, Polygon:Polygon$$module$runner$environment, Star:Star$$module$runner$environment, 
    Ellipse:Ellipse$$module$runner$environment, Circle:Circle$$module$runner$environment, Arc:Arc$$module$runner$environment, Point:Point$$module$runner$environment, color:color$$module$runner$environment, tools:tools$$module$runner$environment, gradient:gradient$$module$runner$environment, easing:easing$$module$runner$environment, filter:filter$$module$runner$environment, stage:a, version:version$$module$runner$environment};
    this.assetLoader = b;
    c.Animation = bindConstructorToParameters$$module$runner$environment(Animation$$module$runner$environment, [a]);
    c.KeyframeAnimation = bindConstructorToParameters$$module$runner$environment(KeyframeAnimation$$module$runner$environment, [a]);
    c.Bitmap = bindConstructorToParameters$$module$runner$environment(Bitmap$$module$runner$environment, [b]);
    c.FontFamily = bindConstructorToParameters$$module$runner$environment(FontFamily$$module$runner$environment, [b]);
    c.Movie = bindConstructorToParameters$$module$runner$environment(Movie$$module$runner$environment, [a]);
    c.Sprite = bindConstructorToParameters$$module$runner$environment(Sprite$$module$runner$environment, [b]);
    c.Video = bindConstructorToParameters$$module$runner$environment(Video$$module$runner$environment, [b]);
    c.bonsai = c;
    c.env = c.environment = tools$$module$runner$environment.mixin({windowHeight:0, windowWidth:0, windowScrollX:0, windowScrollY:0, offsetX:0, offsetY:0}, EventEmitter$$module$runner$environment)
  }
  module$runner$environment.module$exports = Environment$$module$runner$environment;
  module$runner$environment.module$exports && (module$runner$environment = module$runner$environment.module$exports);
  var module$runner$stage = {}, EventEmitter$$module$runner$stage = module$event_emitter, DisplayList$$module$runner$stage = module$runner$display_list, color$$module$runner$stage = module$color, Timeline$$module$runner$stage = module$runner$timeline, tools$$module$runner$stage = module$tools, Registry$$module$runner$stage = module$runner$registry, AssetLoader$$module$runner$stage = module$asset$asset_loader, Environment$$module$runner$stage = module$runner$environment, uiEvent$$module$runner$stage = 
  module$runner$ui_event, URI$$module$runner$stage = module$uri, hitch$$module$runner$stage = tools$$module$runner$stage.hitch, DEFAULT_FRAMERATE$$module$runner$stage = 30;
  function collectChildIds$$module$runner$stage(a) {
    var a = a._children, b = [];
    if(a) {
      for(var c = 0, d = a.length;c < d;++c) {
        a[c] && (b.push(a[c].id), b.push.apply(b, collectChildIds$$module$runner$stage(a[c])))
      }
    }
    return b
  }
  function Stage$$module$runner$stage(a) {
    var b = this.registry = new Registry$$module$runner$stage, b = this.assetLoader = (new AssetLoader$$module$runner$stage(b.pendingAssets)).on("request", hitch$$module$runner$stage(this, this.loadAsset, null)).on("destroy", hitch$$module$runner$stage(this, this.destroyAsset));
    this.env = new Environment$$module$runner$stage(this, b);
    this.stage = this.root = this;
    this._canRender = !0;
    Object.defineProperties(this, {id:{value:0}});
    this._queuedFramesById = {};
    this._queuedFrames = [];
    this.messageChannel = a;
    a.on("message", this, this.handleEvent)
  }
  Stage$$module$runner$stage.prototype = {_isFrozen:!0, assetBaseUrl:new URI$$module$runner$stage(null, null, ""), height:Infinity, width:Infinity, destroy:function() {
    clearInterval(this._interval);
    return this
  }, freeze:function() {
    clearInterval(this._interval);
    this._isFrozen = !0;
    return this
  }, handleEvent:function(a) {
    var b = a.command, a = a.data;
    switch(b) {
      case "options":
        this.setOptions(a);
        break;
      case "play":
      ;
      case "stop":
      ;
      case "freeze":
      ;
      case "unfreeze":
        this[b](a);
        break;
      case "assetLoadSuccess":
        this.assetLoader.handleEvent("load", a.id, a);
        break;
      case "assetLoadError":
        this.assetLoader.handleEvent("error", a.id, a);
        break;
      case "userevent":
        if(b = a.targetId ? this.registry.displayObjects[a.targetId] : this) {
          a = a.event, a.target = b, uiEvent$$module$runner$stage(a).emitOn(b)
        }
        break;
      case "env":
        tools$$module$runner$stage.mixin(this.env.exports.env, a);
        this.env.exports.env.emit("change", a);
        break;
      case "message":
        this.emit("message", a);
        break;
      case "canRender":
        this._canRender = !0, this.postFrames()
    }
  }, loadAsset:function(a, b, c, d) {
    a = a || this.assetBaseUrl;
    tools$$module$runner$stage.forEach(c.resources, function(b) {
      var c = URI$$module$runner$stage.parse(b.src);
      "data" !== c.scheme && (b.src = a.resolveUri(c).toString())
    });
    this.post({command:"loadAsset", data:{id:b, type:d, request:c}})
  }, destroyAsset:function(a) {
    this.post({command:"destroyAsset", data:{id:a}})
  }, loadSubMovie:function() {
  }, getSubMovieEnvironment:function(a, b) {
    b = this.assetBaseUrl.resolveUri(b);
    a.url = b.toString();
    var c = "data" === b.scheme ? null : b;
    return new Environment$$module$runner$stage(a, (new AssetLoader$$module$runner$stage(this.registry.pendingAssets)).on("request", hitch$$module$runner$stage(this, this.loadAsset, c)))
  }, loop:function() {
    this.emitFrame();
    for(var a = this.registry, b = tools$$module$runner$stage.removeValueFromArray(a.movies.movies), c = [this], d, e, f = 0;f < d || f < (d = b.length);) {
      if(e = b[f]) {
        e.emitFrame(), c.push(e)
      }
      f += 1
    }
    this.emit("subMoviesAdvanced");
    f = 0;
    for(d = c.length;f < d;++f) {
      c[f].incrementFrame()
    }
    b = this._queuedFramesById;
    c = this._queuedFrames;
    d = a.displayObjects;
    e = a.needsDraw;
    var f = a.needsInsertion, g;
    for(g in e) {
      var h = e[g], j = b[g];
      if(d[g]) {
        a = h.composeRenderMessage ? h.composeRenderMessage(c[j]) : a = {id:+g};
        if(g in f) {
          delete f[g];
          var i = h.next;
          a.next = i && i.id;
          a.parent = h.parent.id
        }
        h.emit("render");
        delete a.detach
      }else {
        h = collectChildIds$$module$runner$stage(h), a = {id:+g, detach:!0}, h.length && (a.children = h)
      }
      delete e[g];
      0 <= j ? c[j] = a : b[g] = c.push(a) - 1
    }
    this.emit("exitFrame");
    this.postFrames()
  }, post:function(a) {
    this.messageChannel.notifyRenderer(a);
    return this
  }, postFrames:function() {
    var a = this._queuedFrames;
    this._canRender && a.length && (this._canRender = !1, this._queuedFramesById = {}, this._queuedFrames = [], this.post({command:"render", data:a, frame:this.currentFrame}))
  }, sendMessage:function(a) {
    return this.post({command:"message", data:a})
  }, setFramerate:function(a) {
    if(a) {
      var b = this._isFrozen;
      this.freeze();
      this.framerate = Math.abs(a | 0);
      b || this.unfreeze()
    }
  }, setOptions:function(a) {
    this.options = a;
    this.baseUrl = URI$$module$runner$stage.parse(a.baseUrl);
    this.assetBaseUrl = URI$$module$runner$stage.parse(a.assetBaseUrl || a.url || a.urls && a.urls[0] || a.baseUrl);
    this.setFramerate(a.framerate || DEFAULT_FRAMERATE$$module$runner$stage);
    this.width = +a.width || Infinity;
    this.height = +a.height || Infinity;
    return this
  }, setRendering:function(a) {
    "crispEdges" === a && this.post({command:"renderConfig", data:{item:"crispEdges", value:!0}})
  }, setBackgroundColor:function(a) {
    this.post({command:"renderConfig", data:{item:"backgroundColor", value:color$$module$runner$stage.parse(a)}})
  }, unfreeze:function() {
    this._isFrozen && (this._interval = setInterval(hitch$$module$runner$stage(this, this.loop), 1E3 / this.framerate), this._isFrozen = !1)
  }};
  tools$$module$runner$stage.mixin(Stage$$module$runner$stage.prototype, EventEmitter$$module$runner$stage, DisplayList$$module$runner$stage, Timeline$$module$runner$stage);
  module$runner$stage.module$exports = Stage$$module$runner$stage;
  module$runner$stage.module$exports && (module$runner$stage = module$runner$stage.module$exports);
  var module$bootstrapper$context$iframe$bootstrap = {}, Stage$$module$bootstrapper$context$iframe$bootstrap = module$runner$stage, makeScriptLoader$$module$bootstrapper$context$iframe$bootstrap = module$bootstrapper$context$script_loader, tools$$module$bootstrapper$context$iframe$bootstrap = module$tools;
  module$bootstrapper$context$iframe$bootstrap.module$exports = function(a, b) {
    var c = b.document, d = makeScriptLoader$$module$bootstrapper$context$iframe$bootstrap(function(a, b) {
      var d = c.createElement("script");
      d.src = a;
      d.onload = function() {
        b(null)
      };
      d.onerror = function() {
        b("Could not load: " + a)
      };
      c.documentElement.appendChild(d)
    });
    b.load = function(a, b) {
      return d.load(a, b)
    };
    b.wait = function() {
      return d.wait()
    };
    b.done = function() {
      return d.done()
    };
    var e = new Stage$$module$bootstrapper$context$iframe$bootstrap(a), f = e.env.exports;
    tools$$module$bootstrapper$context$iframe$bootstrap.mixin(b, f);
    var g = b.exports = {};
    e.loadSubMovie = function(a, b, d) {
      var k = c.createElement("iframe");
      c.documentElement.appendChild(k);
      var l = k.contentWindow, m = d || new f.Movie, d = e.getSubMovieEnvironment(m, a);
      l.document.open();
      l.document.close();
      tools$$module$bootstrapper$context$iframe$bootstrap.mixin(l, d.exports);
      delete g.stage;
      tools$$module$bootstrapper$context$iframe$bootstrap.mixin(l.bonsai, g);
      tools$$module$bootstrapper$context$iframe$bootstrap.mixin(l, g);
      l.stage = m;
      m.root = this;
      makeScriptLoader$$module$bootstrapper$context$iframe$bootstrap(function(a, b) {
        var c = l.document.createElement("script");
        c.src = a;
        c.onload = function() {
          b(null)
        };
        c.onerror = function() {
          b("Could not load: " + a)
        };
        l.document.documentElement.appendChild(c)
      }).load(e.assetBaseUrl.resolveUri(a), function(a) {
        a ? b.call(m, a) : b.call(m, null, m)
      })
    };
    a.on("message", function(c) {
      "loadScript" === c.command ? d.load(c.url, function() {
        a.notify({command:"scriptLoaded", url:c.url})
      }) : "runScript" === c.command ? d.load("data:text/javascript," + encodeURIComponent(c.code)) : "exposePluginExports" === c.command && (delete g.stage, tools$$module$bootstrapper$context$iframe$bootstrap.mixin(f, g), tools$$module$bootstrapper$context$iframe$bootstrap.mixin(b, g))
    });
    e.unfreeze();
    a.notifyRenderer({command:"isReady"})
  };
  module$bootstrapper$context$iframe$bootstrap.module$exports && (module$bootstrapper$context$iframe$bootstrap = module$bootstrapper$context$iframe$bootstrap.module$exports);
  var module$bootstrapper$_build$iframe = {}, player$$module$bootstrapper$_build$iframe = module$bootstrapper$player, bootstrapIframe$$module$bootstrapper$_build$iframe = module$bootstrapper$context$iframe$bootstrap, IframeRunnerContext$$module$bootstrapper$_build$iframe = module$bootstrapper$context$iframe$context, SvgRenderer$$module$bootstrapper$_build$iframe = module$renderer$svg$svg, tools$$module$bootstrapper$_build$iframe = module$tools, bootstrapUtil$$module$bootstrapper$_build$iframe = module$bootstrapper$util;
  if("undefined" != typeof window && window.messageChannel) {
    setTimeout(function() {
      var a = window.messageChannel;
      delete window.messageChannel;
      bootstrapIframe$$module$bootstrapper$_build$iframe(a, window)
    }, 1)
  }else {
    window.bonsai = player$$module$bootstrapper$_build$iframe;
    var scripts$$module$bootstrapper$_build$iframe = tools$$module$bootstrapper$_build$iframe.map(document.getElementsByTagName("script"), function(a) {
      return a.src
    });
    player$$module$bootstrapper$_build$iframe.Renderer = SvgRenderer$$module$bootstrapper$_build$iframe;
    player$$module$bootstrapper$_build$iframe.setup({baseUrl:tools$$module$bootstrapper$_build$iframe.baseUri(document), runnerContext:IframeRunnerContext$$module$bootstrapper$_build$iframe, runnerUrl:bootstrapUtil$$module$bootstrapper$_build$iframe.chooseRunnerUrl(scripts$$module$bootstrapper$_build$iframe, /iframe/) || "bonsai.js"})
  }
  module$bootstrapper$_build$iframe.module$exports && (module$bootstrapper$_build$iframe = module$bootstrapper$_build$iframe.module$exports)
})();

