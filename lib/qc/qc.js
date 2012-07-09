var qc = null;
;(function(){;var __Case=( function() {
  function Case(args) {
      this.tags = [];
      this.collected = [];
      this.args = args;
  }
  Case.prototype.assert = function (bool) {
    if (!bool) {
      throw ('AssertFailed');
    }
  };
  Case.prototype.guard = function (bool) {
    if (!bool) {
      throw ('InvalidCase');
    }
  };
  Case.prototype.addTag = function (tag) {
    this.tags.push(tag);
  };
  Case.prototype.collect = function (value) {
    var found = false;
    for (var i = 0; i < this.collected.length; i++) {
      if (this.collected[i][1] === value) {
        this.collected[i][0] += 1;
        found = true;
        break;
      }
    }
    if (!found) {
      this.collected.push([1, value]);
    }
  };
  Case.prototype.noteArg = function (value) {
    this.args.push(value);
  };
  return Case;
})();

;var __Config=( function() {
  function Config(params) {
    this.maxPass = params.maxPass || 100;
    this.maxInvalid = params.maxInvalid || 10;
    this.maxShrink = parseInt(params.maxShrink) || 1;
    this.maxShrunkArgs = parseInt(params.maxShrunkArgs) || 100;
    this.searchString = params.searchString || '';
    if (params.allowConfigByUrlParams && window.location.search){
      var parts = window.location.search.replace(/\?/, '').split('&');
      var self = this;
      parts.forEach(function(p){
        var keyValue = p.split('=');
        if (typeof self[keyValue[0]] != 'undefined') self[keyValue[0]] = decodeURIComponent(keyValue[1]);
      });
    }
  }
  Config.prototype.needsWork = function (numPass, numInvalid) {
      return numInvalid < this.maxInvalid &&
          numPass < this.maxPass;
  };
  return Config;
})();

;var __ConsoleListener=( function() {
  function ConsoleListener(maxCollected) {
     this.maxCollected = maxCollected || -1;
  }
  ConsoleListener.prototype.noteResult = function (result) {
      var i, tags, tag, distr, d;
      if (result.status === 'pass') {
        this.passed(result);
      } else if (result.status === 'fail') {
        this.failure(result);
      } else {
        this.invalid(result);
      }
            tags = result.stats.tags;
      if (tags && tags.length > 0) {
          this.log('tags:');
          for (i = 0; i < tags.length;i++) {
              tag = tags[i];
              if (tag instanceof Array) {
                  this.log(tag[0] + ' : ' + tag[1]);
              } else {
                  this.log(tag);
              }
          }
      }
            if (this.maxCollected !== 0 && result.stats.collected.length > 0) {
          distr = result.stats.collected;
          distr = distr.data.slice(
              0, this.maxCollected === -1 ? distr.data.length :
                 Math.min(distr.data.length, this.maxCollected));
          distr.sort(function (a, b) {
              return -1 * (a[0] - b[0]);
          });
          this.log('collected:');
          for (i = 0; i < distr.length; i++) {
              d = distr[i];
              this.log(d[0] * 100 + '% : ' + d[1]);
          }
      }
  };
  ConsoleListener.prototype.done = function (result) {
    this.log('done.');
  };
  ConsoleListener.prototype.log = function(str) {
    console.log(str);
  };
  ConsoleListener.prototype.passed = function(str) {
    console.log(str);
  };
  ConsoleListener.prototype.invalid = function(str) {
    console.warn(str);
  };
  ConsoleListener.prototype.failure = function(str) {
    console.error(str);
  };
  return ConsoleListener;
})();

;var __HtmlListener=( function(ConsoleListener) {
  function HtmlListener(params) {
    this.maxCollected = 0;
    this._showPassedTests = params.showPassedTests || true;
    this._domNode = document.getElementById(params.nodeId);
    if (params.filterNodeId){
      renderFilterHtml(params.filterNodeId);
    }
  }
  HtmlListener.prototype = new ConsoleListener();
  function getResultHtml(result){
    var html = '<b>$result:</b> <a href="?$groupFilterUrl">$groupName</a>: <a href="?$filterUrl">$name</a> --- $passesx Pass, $failsx Fail, $invalidsx Invalids<br/>';
    html = html.replace('$result', result.status.toUpperCase());
    html = html.replace('$groupName', result.groupName);
    var query = parseQuery();
    query.searchString = result.groupName;
    html = html.replace('$groupFilterUrl', getQueryString(query));
    var query = parseQuery();
    query.searchString = result.name;
    html = html.replace('$filterUrl', getQueryString(query));
    html = html.replace('$name', result.name);
    html = html.replace('$passes', result.stats.counts.pass);
    html = html.replace('$fails', result.stats.counts.fail);
    html = html.replace('$invalids', result.stats.counts.invalid);
    return html;
  }
  HtmlListener.prototype.passed = function (result) {
    if (this._showPassedTests) {
      this._domNode.innerHTML += getResultHtml(result);
    }
  };
  HtmlListener.prototype.invalid = function (result) {
    this._domNode.innerHTML += getResultHtml(result);
  };
  HtmlListener.prototype.failure = function (result) {
    var html = getResultHtml(result) + 'Failed with<pre>$failedCase</pre>';
    html = html.replace('$failedCase', JSON.stringify(result.failedCase, null, 4));
    this._domNode.innerHTML += html;
  };
  HtmlListener.prototype.log = function (str) {
    this._domNode.innerHTML += str + '<br>';
  };
  HtmlListener.prototype.done = function (str) {
    this._domNode.innerHTML += 'DONE.';
  };
  function parseQuery(){
    var query = {};
    if (window.location.search){
      var parts = window.location.search.replace(/\?/, '').split('&');
      parts.forEach(function(p){
        var keyValue = p.split('=');
        query[keyValue[0]] = decodeURIComponent(keyValue[1]);
      });
    }
    return query;
  }
        function renderFilterHtml(nodeId){
    var node = document.getElementById(nodeId);
    node.appendChild(buildTestLinks());
    node.appendChild(buildMaxPassLinks());
    node.innerHTML += '<hr/>';
  }
  function getQueryString(query){
    var ret = [];
    for (var i in query){
      ret.push(i + '=' + encodeURIComponent(query[i]));
    }
    return ret.join('&');
  }
  function buildTestLinks(){
    var query = parseQuery();
    var node = document.createElement('div');
    node.innerHTML = 'filter groups: ';
    delete query.searchString;
    node.innerHTML += '<a href=?'+ getQueryString(query) +'>All tests</a> ::: ';
    qc.groupNames.sort().forEach(function(name){
      query.searchString = name;
      node.innerHTML += '<a href=?'+ getQueryString(query) +'>'+name+'</a> ';
    });
    return node;
  }
  function buildMaxPassLinks(){
    var query = parseQuery();
    var node = document.createElement('div');
    node.innerHTML = 'max passes: ';
    var maxPasses = [100, 500, 1000, 10000, 100000];
    for (var i=0; i<maxPasses.length; i++){
      query.maxPass = maxPasses[i];
      node.innerHTML += ' <a href=?'+ getQueryString(query) +'>' + maxPasses[i] + '</a> ';
    }
    return node;
  }
  return HtmlListener;
})(__ConsoleListener);

;var __NodeConsoleListener=( function(ConsoleListener) {
  function NodeConsoleListener() {
    ConsoleListener.apply(this, arguments);   };
  NodeConsoleListener.prototype = new ConsoleListener();
  NodeConsoleListener.prototype.passed = function (result) {
    process.stdout.write('\033[32m.\033[0m');   };
  NodeConsoleListener.prototype.done = function () {
    console.log('\nDONE.');
  };
    NodeConsoleListener.prototype.failure = function (result) {
    console.log('\n\033[31mFAIL\033[0m', JSON.stringify(result).slice(0, 50));
  };
    NodeConsoleListener.prototype.log = function (result) {
  };
  NodeConsoleListener.prototype.invalid = function (result) {
  };
  return NodeConsoleListener;
})(__ConsoleListener);

;var __Distribution=( function() {
  function Distribution(d) {
    this.data = addUpSameValues(d);
    this.normalize();
    this.length = this.data.length;
  }
  function addUpSameValues(data){
    var ret = [];
    if (data.length>0){
      ret[0] = [data[0][0], data[0][1]];
      for (var i=1, l=data.length; i<l; i++){
        var val = data[i][1];
                var wasFound = false;
        for (var j=0, l1=ret.length; j<l1; j++){
          if (val == ret[j][1]){
            ret[j][0] += data[i][0];
            wasFound = true;
            break;
          }
        }
        if (!wasFound){
          ret.push([data[i][0], data[i][1]]);
        }
      }
    }
    return ret;
  }
  Distribution.prototype.normalize = function () {
      var sum = 0, i;
      for (i = 0; i < this.data.length; i++) {
          sum += this.data[i][0];
      }
      for (i = 0; i < this.data.length; i++) {
          this.data[i][0] /= sum;
      }
  };
  Distribution.prototype.getProbability = function (x) {
      for (var i = 0; i < this.data.length; i++) {
          if (this.data[i][1] === x) {
              return this.data[i][0];
          }
      }
      return 0;
  };
  Distribution.prototype.getMostProbable = function () {
      var max = 0, ret = null, i;
      for (i = 0; i < this.data.length; i++) {
          if (this.data[i][0] > max) {
              max = this.data[i][0];
              ret = this.data[i][1];
          }
      }
      return ret;
  };
  Distribution.prototype.pick = function () {
      var i, r = Math.random(), s = 0;
      for (i = 0; i < this.data.length; i++) {
          s += this.data[i][0];
          if (r < s) {
              return this.data[i][1];
          }
      }
  };
  Distribution.uniform = function (data) {
    var ret = [];
    for (var i=0, l=data.length; i<l; i++){
      ret.push([1, data[i]]);
    }
    return new Distribution(ret);
  };
  return Distribution;
})();

;var __Fail=( function() {
  function Fail(prop, stats, failedCase, shrinkedArgs) {
      this.status = 'fail';
      this.prop = prop;
      this.stats = stats;
      this.failedCase = failedCase;
      this.shrinkedArgs = shrinkedArgs;
      this.name = prop.name;
      this.groupName = prop.groupName;
  }
  Fail.prototype.toString = function () {
      function tagstr(tags) {
          var str, i;
          if (!tags || tags.length === 0) {
              return '';
          }
          str = '(tags: ' + tags[0];
          for (i = 1; i < tags.length; i++) {
              str += ', ' + tags[i];
          }
          return str + ')';
      }
      function shrinkstr(arg) {
          return arg === null ? '' : '\nminCase: ' + arg;
      }
      return this.name + tagstr(this.stats.tags) +
             ' failed with: counts=' + this.stats +
             ' failedCase: ' + this.failedCase +
             shrinkstr(this.shrinkedArgs);
  };
  return Fail;
})();

;var __core=( function(Distribution, Case, ConsoleListener) {
  var exports = {};
  var allProps = exports.allProps = [];
  exports.resetProps = function() {
    allProps = [];
  };
  exports.runProps = function(config, listener) {
    var once, i = 0;
    listener = listener || new ConsoleListener();
    var propsToRun = filterProps(config.searchString);
    if (typeof setTimeout !== 'undefined') {
            once = function () {
        if (i >= propsToRun.length) {
          listener.done();
          return;
        }
        var currentProp = propsToRun[i];
        var result = currentProp.run(config);
        listener.noteResult(result);
        i += 1;
        setTimeout(once, 0);
      };
      once();
    } else {
      for (; i < propsToRun.length; i++) {
        listener.noteResult(propsToRun[i].run(config));
      }
    }
  };
  function filterProps(searchString) {
    var ret = [];
    if (!searchString) {
            ret = allProps;
    }else if (searchString.match(/^\/.*\/$/)) {
            var regexp = new RegExp(searchString.slice(1, -1));
      ret = allProps.filter(function(prop) {
        return prop.name.match(regexp) || prop.groupName.match(regexp);
      });
    } else {
            var searchFor = searchString.toLowerCase();
      ret = allProps.filter(function(prop) {
        return (prop.name.toLowerCase().indexOf(searchFor) != -1) || (prop.groupName.toLowerCase().indexOf(searchFor) != -1);
      });
    }
    return ret;
  }
    exports.frequency = function() {
    var d = new Distribution(arguments);
    return function () {
      return d.pick();
    };
  };
  exports.choose = function() {
    var d = Distribution.uniform(arguments);
    return function () {
      return d.pick();
    };
  };
  exports.justSize = {
    arb: function (size) {
      return size;
    },
    shrink: null
  };
  exports.expectException = function(fn) {
    return function (c) {
      try {
        fn.apply(this, arguments);
      } catch (e) {
        if (e === 'AssertFailed' || e === 'InvalidCase') {
          throw e;
        }
        c.assert(true);
        return;
      }
      c.assert(false);
    };
  };
  exports.failOnException = function(fn) {
    return function (c) {
      try {
        fn.apply(this, arguments);
      } catch (e) {
        if (e === 'AssertFailed' || e === 'InvalidCase') {
          throw e;
        }
        c.assert(false);
      }
    };
  };
  exports.generateValue = function(generator, size) {
    return generator.func(size);
  };
  exports.generateShrunkValues = function(gen, size, arg) {
    if (typeof gen.shrink == 'undefined') {
      return [];
    }
    return gen.shrink(size, arg) || [];
  };
  return exports;
})(__Distribution,__Case,__ConsoleListener);

;var __Invalid=( function() {
  function Invalid(prop, stats) {
      this.status = 'invalid';
      this.prop = prop;
      this.stats = stats;
      this.name = prop.name;
      this.groupName = prop.groupName;
  }
  Invalid.prototype.toString = function () {
      return 'Invalid (' + this.name + ') counts=' + this.stats;
  };
  return Invalid;
})();

;var __Pass=( function() {
  function Pass(prop, stats) {
      this.status = 'pass';
      this.prop = prop;
      this.stats = stats;
      this.name = prop.name;
      this.groupName = prop.groupName;
  }
  Pass.prototype.toString = function () {
      return 'Pass (' + this.name + ') counts=' + this.stats;
  };
  return Pass;
})();

;var __random=( function() {
  var exports = {};
  exports.getPositiveInteger = function(top) {
        top = typeof top == 'undefined' ? 1 : top;
    return Math.floor(Math.random() * top);
  };
  exports.getInteger = function(top) {
    return Math.floor(Math.random() * top * 2) - top;
  };
  exports.getPositiveFloat = function(top) {
    return (Math.random() * top);
  };
  exports.getFloat = function(top) {
    return (Math.random() * top * 2) - top;
  };
  return exports;
})();

;var __Stats=(function(Pass, Invalid) {
  function Stats() {
    this.counts = {
      pass:0,
      invalid:0,
      fail:0
    };
    this.shrinkCounts = {
      pass:0,
      invalid:0,
      fail:0
    };
    this.results = [];
    this.shrinkResults = [];
    this.tags = [];
    this.collected = null;
    this.addInvalid = function(args) {
      this.counts.invalid++;
      this.results.push({result:'invalid', args:args});
    };
    this.addPass = function(args) {
      this.counts.pass++;
      this.results.push({result:'pass', args:args});
    };
    this.addFail = function(args) {
      this.counts.fail++;
      this.results.push({result:'fail', args:args});
    };
    this.addShrinkInvalid = function(args) {
      this.shrinkCounts.invalid++;
      this.shrinkResults.push({result:'invalid', args:args});
    };
    this.addShrinkPass = function(args) {
      this.shrinkCounts.pass++;
      this.shrinkResults.push({result:'pass', args:args});
    };
    this.addShrinkFail = function(args) {
      this.shrinkCounts.fail++;
      this.shrinkResults.push({result:'fail', args:args});
    };
    this.addTags = function (ts) {
      var i, j, tag, found;
      for (i = 0; i < ts.length; i++) {
        tag = ts[i];
        found = false;
        for (j = 0; j < this.tags.length; j++) {
          if (this.tags[j][1] === tag) {
            found = true;
            this.tags[j][0] += 1;
          }
        }
        if (!found) {
          this.tags.push([1, tag]);
        }
      }
    };
    this.newResult = function (prop) {
      if (this.counts.pass > 0) {
        return new Pass(prop, this);
      } else {
        return new Invalid(prop, this);
      }
    };
    this.toString = function () {
      return '(pass=' + this.counts.pass + ', invalid=' + this.counts.invalid + ')';
    };
  };
  return Stats;
})(__Pass,__Invalid);

;var __generator_base=( function(random, qc, Distribution) {
  var exports = {};
  exports.chooseGenerator = function() {
    var d = Distribution.uniform(arguments);
    return {
      func: function (size) {
          return qc.generateValue(d.pick(), size);
      },
      shrink: null
    };
  };
  exports.chooseGenerators = function() {
    var gens = [].slice.call(arguments);
    return {
      func: function (size) {
        var ret = [];
        while(ret.length==0){
          for (var i=0, l=gens.length; i<l; i++){
            if (Math.random() > 0.5){
              ret.push(qc.generateValue(gens[i], size));
            }
          }
        }
        return ret;
      },
      shrink: null
    };
  };
  var chooseValue = exports.chooseValue = function() {
    var d = Distribution.uniform(arguments);
    return {
      func: function () {
        return d.pick();
      }
    };
  };
  exports.booleans = function() {
    return chooseValue(false, true);
  };
  var nulls = exports.nulls = function() {
    return chooseValue(null);
  };
  var arrays = exports.arrays = function(generator, shrinkStrategy, minSize) {
    var generatorFunc = function(size) {
      var i, list = [];
      var listSize = random.getPositiveInteger(size);
      if (minSize) {
        listSize = Math.max(listSize, minSize);
      }
      for (i = 0; i < listSize; i += 1) {
        list.push(qc.generateValue(generator, size));
      }
      return list;
    };
    return { func: generatorFunc, shrink: shrinkStrategy || arrShrinkOne };
  };
  exports.arraysOfSize = function(generators, shrinkStrategy) {
    var generator = function(size) {
      return generators.map(function(g){ return qc.generateValue(g, size); });
    };
    return { func: generator, shrink: shrinkStrategy };
  };
  exports.nonEmptyArrays = function(generator, shrinkStrategy) {
    return arrays(generator, shrinkStrategy, 1);
  };
  exports.dates = function() {
    return {
      func: function () {
          return new Date();
      }
    };
  };
  exports.nullOr = function(otherGen) {
            var d = new Distribution([[10, nulls()], [90, otherGen]]);
      return {
          func: function (size) {
                  return qc.generateValue(d.pick(), size);
          },
          shrink: function (size, a) {
              if (a === null) {
                  return [];
              } else {
                  return [null].concat(qc.generateShrunkValues(otherGen, size, a));
              }
          }
      };
  };
  var arrShrinkOne = exports.arrShrinkOne = function(size, arr) {
      if (!arr || arr.length === 0) return [];
      if (arr.length === 1) return [[]];
      var copyAllBut = function(idx) {
          var i, tmp = new Array(arr.length - 1);
          for (i = 0; i < arr.length; i++) {
              if (i === idx) {
                  continue;
              }
              tmp[i < idx ? i : i - 1] = arr[i];
          }
          return tmp;
      };
      var i, ret = new Array(arr.length);
      for (i = 0; i < arr.length; i++) {
          ret[i] = copyAllBut(i);
      }
      return ret;
  };
  exports.mod = function(a, fn) {
      return {
          func: function (size) {
              return fn(qc.generateValue(a, size));
          }
      };
  };
  var undefineds = exports.undefineds = function() {
    return chooseValue(undefined);
  };
  exports.undefinedOr = function(opt) {
      var d = new Distribution([[10, undefineds()], [90, opt]]);
      return {
          func: function (size) {
              return qc.generateValue(d.pick(), size);
          },
          shrink: function (size, a) {
              return a === undefined || a === null ?
                         [] :
                         qc.generateShrunkValues(opt, size, a);
          }
      };
  };
  return exports;
})(__random,__core,__Distribution);

;var __generator_number=( function(random) {
  var exports = {};
  exports.integers = function() {
    return {
      func: function(size) {
        return random.getInteger(size);
      },
      shrink: function (size, x) {
          var tmp = x, ret = [];
          if (x < 0) {
              ret.push(-x);
          }
          while (true) {
              tmp = tmp / 2;
              if (tmp === 0 || isNaN(tmp)) {                   break;
              }
              tmp = tmp < 0 ? Math.ceil(tmp) : Math.floor(tmp);
              ret.push(x - tmp);
          }
          return ret;
      }
    };
  };
  exports.positiveIntegers = function() {
    return {
      func: function(size) {
        return random.getPositiveInteger(size);
      },
      shrink: function (size, x) {
          var tmp = x, ret = [];
          while (true) {
              if (0 === (tmp = Math.floor(tmp / 2))) {
                  break;
              }
              ret.push(x - tmp);
          }
          return ret;
      }
    };
  };
  exports.floats = function(digitsAfterComma) {
    return {
      func: function(size) {
        var ret = random.getFloat(size);
        if (digitsAfterComma){
          var precision = Math.pow(10, digitsAfterComma);
          ret = parseInt(ret * precision)/precision;
        }
        return ret;
      },
      shrink: function (size, x) {
          var tmp, ret = [];
          if (x < 0) {
              ret.push(-x);
              tmp = Math.ceil(x);
          } else {
              tmp = Math.floor(x);
          }
          if (tmp !== x) ret.push(tmp);
          return ret;
      }
    };
  };
  exports.integerRanges = function(minValue, maxValue) {
    var min = minValue < maxValue ? minValue : maxValue;
    var max = minValue < maxValue ? maxValue : minValue;
    var maxMinusMin = max - min;     return {
      func: function() {
        return Math.floor(Math.random() * maxMinusMin) + min;
      }
    };
  };
  exports.floatRanges = function(minValue, maxValue, digitsAfterComma) {
    var min = minValue < maxValue ? minValue : maxValue;
    var max = minValue < maxValue ? maxValue : minValue;
    var maxMinusMin = max - min;     return {
      func: function() {
          var ret = Math.random() * maxMinusMin + min;
        return ret;
      }
    };
  };
  return exports;
})(__random);

;var __generator_string=(function(qc, base, number) {
  var exports = {};
  exports.strings = function() {
      var a = base.arrays(number.integerRanges(32, 255));
      var func = function (size) {
                    var tmp = qc.generateValue(a, size+10);
          return String.fromCharCode.apply(String, tmp);
      };
      var shrink = function (size, str) {
          var i, ret = [], tmp = new Array(str.length);
          for (i = 0; i < str.length; i++) {
              tmp[i] = str.charCodeAt(i);
          }
          tmp = qc.generateShrunkValues(a, size, tmp);
          ret = [];
          for (i = 0; i < tmp.length; i++) {
              ret.push(String.fromCharCode.apply(String, tmp[i]));
          }
          return ret;
      };
      return { func: func, shrink: shrink };
  };
  exports.chararcters = function() {
    return base.mod(
      number.integerRanges(32, 255),
      function (num) { return String.fromCharCode(num); }
    );
  };
  exports.nonEmptys = {
  };
  return exports;
})(__core,__generator_base,__generator_number);

;var __generator___all__=( function(base, number, string) {
      var modules = {
    'number': number,
    'string': string
  };
    for (var i in base) {
    modules[i] = base[i];
  }
  return modules;
})(__generator_base,__generator_number,__generator_string);

;var __Prop=(function(qc, Case, Distribution, Fail, Stats) {
  function Prop(name, gens, body, groupName) {
    this.name = name;
    this.gens = gens;
    this.body = body;
    this.groupName = groupName;
  }
  Prop.prototype.generateArgs = function (size) {
      var i, gen, args = [];
      for (i = 0; i < this.gens.length; i += 1) {
          gen = this.gens[i];
          args.push(qc.generateValue(gen, size));
      }
      return args;
  };
  Prop.prototype.generateShrunkArgs = function (size, args, maxShrunkArgs) {
            var i, gen, countShrunk = 0, shrunk = [], newArgs = [];
      for (i = 0; i < this.gens.length; i++) {
          gen = this.gens[i];
          if ((gen instanceof Function) || gen.shrink === undefined ||
             gen.shrink === null || !(gen.shrink instanceof Function)) {
              shrunk.push([args[i]]);
          } else {
              tmp = gen.shrink(size, args[i]);
              if (tmp === undefined ||
                  (tmp instanceof Array && tmp.length === 0)) {
                  shrunk.push([args[i]]);
              } else {
                  countShrunk++;
                  shrunk.push(tmp);
              }
          }
      }
      if (countShrunk === 0) {
          return [];
      }
            var idxs = [];
      for (i = 0; i < this.gens.length; i++) {
          idxs[i] = 0;
      }
            while (idxs[0] < shrunk[0].length) {
          var tmp = [];
          for (i = 0; i < shrunk.length; i++) {
              tmp[i] = shrunk[i][idxs[i]];
          }
          newArgs.push(tmp);
                    while (i-- > 0) {
              idxs[i] += 1;
              if (i !== 0 && idxs[i] >= shrunk[i].length) {
                  idxs[i] = 0;
              } else {
                  break;
              }
          }
      };
      return reduceToMaxShrunkArgs(newArgs, maxShrunkArgs);
  };
  function reduceToMaxShrunkArgs(shrunkArgs, maxShrunkArgs) {
      if (maxShrunkArgs && shrunkArgs.length>maxShrunkArgs) {
                                var everyXth = Math.ceil(shrunkArgs.length / maxShrunkArgs);
        var ret = [];
        for (var i=0; i<shrunkArgs.length; i+=everyXth) {
          ret.push(shrunkArgs[i]);
        }
        shrunkArgs = ret;
      }
      return shrunkArgs;
  };
  Prop.prototype.run = function (config) {
    var args, testCase, shrunkArgs;
    var stats = new Stats(), size = 0, collected = [];
    while (config.needsWork(stats.counts.pass, stats.counts.invalid)) {
      args = this.generateArgs(size);
      testCase = new Case(args);
      try {
        this.body.apply(this, [testCase].concat(args));
        stats.addPass(args);
      }
      catch (e) {
        if (e === 'AssertFailed') {
          stats.addFail(args);
          var dist = testCase.collected.length === 0 ?  null : new Distribution(testCase.collected);
          shrunkArgs = this._shrinkLoop(config, size, args, stats);
          return new Fail(this, stats, args, shrunkArgs, testCase.tags, dist);
        } else if (e === 'InvalidCase') {
          stats.addInvalid(args);
        } else {
          throw (e);
        }
      }
      size += 1;
      stats.addTags(testCase.tags);
      collected = collected.concat(testCase.collected);
    }
    stats.collected = collected.length === 0 ? null : new Distribution(collected);
    return stats.newResult(this);
  };
  Prop.prototype._shrinkLoop = function(config, size, args, stats) {
    var i, testCase;
    var failedArgs = [args], shrunkArgs = [];
    for (var loop = 0; loop < config.maxShrink; loop++) {
            shrunkArgs = [];
      for (i = 0; i < failedArgs.length; i++) {
        shrunkArgs = shrunkArgs.concat(
          this.generateShrunkArgs(size, failedArgs[i], config.maxShrunkArgs));
      }
      if (shrunkArgs.length > 0) {
                failedArgs = [];
        for (i = 0; i < shrunkArgs.length; i++) {
          var args = shrunkArgs[i];
          try {
            testCase = new Case(args);
            this.body.apply(this, [testCase].concat(args));
            stats.addShrinkPass(args);
          } catch (e) {
            if (e === 'InvalidCase') {
              stats.addShrinkInvalid(args);
            } else if (e === 'AssertFailed') {
              stats.addShrinkFail(args);
              if (loop === config.maxShrink - 1) {
                return args;
              } else {
                failedArgs.push(args);
              }
            } else {
              throw e;
            }
          }
        }
      }
    }
    return failedArgs.length === 0 ? null : failedArgs[0];
  };
  return Prop;
})(__core,__Case,__Distribution,__Fail,__Stats);

;var __qc=( function(
  core, random,
  generator,
  Config, Distribution, Prop, ConsoleListener, HtmlListener, NodeConsoleListener) {
  var exports = {
    Config: Config,
    Distribution: Distribution,
    Prop: Prop,
    ConsoleListener: ConsoleListener,
    HtmlListener: HtmlListener,
    NodeConsoleListener: NodeConsoleListener,
    generator: generator
  };
  [core, random].map(function(arg) {
        for (var prop in arg) {
      exports[prop] = arg[prop];
    }
  });
  exports.declare = function(name, gens, body) {
      var theProp = new exports.Prop(name, gens, body, testGroupName);
      exports.allProps.push(theProp);
      return theProp;
  };
  var testGroupName = '';
  exports.setTestGroupName = function(groupName) {
    testGroupName = groupName;
    exports.groupNames.push(groupName);
  };
  exports.groupNames = [];
  return exports;
})(__core,__random,__generator___all__,__Config,__Distribution,__Prop,__ConsoleListener,__HtmlListener,__NodeConsoleListener);


qc = __qc;
})();
if (typeof exports!='undefined') exports.qc = qc;
if (typeof define!='undefined') define('qc', function(){return qc});
