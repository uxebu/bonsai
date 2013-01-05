jasmine.Matchers.prototype.toBeBetween = function(a, b) {
  return this.actual < b && this.actual > a;
};

var jasmineEnv = jasmine.getEnv();

var async = function async(fn) {
  // Little wrapper for async tests
  jasmineEnv.currentSpec.queue.add({
    execute: function(next) {
      fn(next);
    }
  });
};

var waitForAsync = function waitForAsync(func) {
  var done = false;
  waitsFor(function() { return done; });
  return function() {
    done = true;
    if (func) func.apply(func, arguments);
  }
};

var roundPathSegments = function(segments) {
  // Rounds segment args to 3 decimal places
  // (avoid JS floating-point issues when testing)
  return segments.map(function(seg) {
    return seg.map(function(p) {
      if (typeof p == 'number') {
        return Math.round(p * 1000) / 1000;
      }
      return p;
    });
  });
}
