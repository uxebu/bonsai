(function(exports) {
  'use strict';

  exports.Profiler = Profiler;
  exports.keys = keys;

  function keys(object) {
    if (object === null || typeof object !== 'object') {
      throw TypeError('keys called on non-object');
    }

    var keys = [];
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

    return keys;
  }

  function Profiler() {
    this.seenObjects = [];
    this.samples = {};
    this.totalTimesStack = [0];
    this.totalTimesStack.lastIndex = 0;
  }

  Profiler.prototype = {
    addSample: function(name, totalTime, selfTime) {
      var samples = this.samples;
      var functionSamples = samples.hasOwnProperty(name)
        ? samples[name]
        : (samples[name] = {totalTimes: [], selfTimes: []});
      functionSamples.totalTimes.push(totalTime);
      functionSamples.selfTimes.push(selfTime);
    },

    getReport: function() {
      var report = {}, samples = this.getSamples();
      for (var name in samples) {
        if (samples.hasOwnProperty(name)) {
          var functionSamples = samples[name];
          report[name] = {
            numCalls: functionSamples.totalTimes.length,
            selfTime: this.statistics(functionSamples.selfTimes),
            totalTime: this.statistics(functionSamples.totalTimes)
          };
        }
      }

      return report;
    },

    getSamples: function() {
      return this.samples;
    },

    getTime: Date.now || function() { return new Date().getTime(); },

    statistics: function(samples) {
      var max = samples[0], min = max, sum = max;
      var numCalls = samples.length;
      for (var i = 1; i < numCalls; i++) {
        var sample = samples[i];
        sum += sample;
        if (sample > max) {
          max = sample;
        }
        else if (sample < min) {
          min = sample;
        }
      }

      var median, sorted = samples.slice().sort(function(a, b) { return a - b; });
      if (numCalls > 0) {
        median = numCalls % 2 ?
          sorted[(numCalls - 1) / 2] :
          (sorted[numCalls / 2] + sorted[numCalls / 2 - 1]) / 2;
      }

      return {
        numCalls: numCalls,
        max: max,
        mean: numCalls ? sum / numCalls : void 0,
        median: median,
        min: min,
        sum: sum
      }
    },

    wrapFunction: function(name, func) {
      if (typeof name !== 'string') {
        throw TypeError('Expected string as first argument, but received a ' + typeof name);
      }

      if (typeof func !== 'function') {
        throw TypeError('Expected function as second argument, but received a ' + typeof name);
      }

      if (this.seenObjects.indexOf(func) !== -1) {
        return func;
      }

      var profiler = this;
      var getTime = this.getTime, totalTimesStack = this.totalTimesStack;
      var wrapper = function wrapper() {
        var lastIndex, returnValue, start, time;

        // add level to total times stack for all nested functions
        totalTimesStack.push(0);
        totalTimesStack.lastIndex += 1;

        // measure time and execute wrapped function
        start = getTime();
        try {
          returnValue = func.apply(this, arguments);
        } finally {
          time = getTime() - start;
          profiler.addSample(name, time, time - totalTimesStack.pop());

          // remove level from total times stack
          lastIndex = totalTimesStack.lastIndex -= 1;

          // add time to the total times stack
          totalTimesStack[lastIndex] += time;
        }

        return returnValue;
      };

      this.wrapObject(name, func);

      wrapper.prototype = func.prototype;
      for (var key in func) {
        if (func.hasOwnProperty(key)) {
          wrapper[key] = func[key];
        }
      }

      return wrapper;
    },

    keys: Object.keys || keys,

    wrapObject: function(objectName, object) {
      if (object === null || object === void 0) {
        return object;
      }

      var seenObjects = this.seenObjects;
      if (seenObjects.indexOf(object) !== -1) {
        return object;
      }
      seenObjects.push(object);

      if (typeof object === 'function') {
        this.wrapObject(objectName + '.prototype', object.prototype, seenObjects);
      }

      var names = this.keys(object);
      for (var i = 0, len = names.length; i < len; i++) {
        var key = names[i], value = object[key];
        switch(typeof value) {
          case 'function':
            object[key] = this.wrapFunction(objectName + '.' + key,object[key]);
          // fallthrough intended
          case 'object':
            if (value !== null) {
              this.wrapObject(objectName + '.' + key, value, seenObjects);
            }
            break;
        }
      }

      return object;
    }
  };
}(typeof exports !== 'undefined' ? exports : (this.prfl = {})));
