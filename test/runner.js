define(['jasmine.helper.js'], function(jasmineHelper) {
  // jasmineCore, jasmineHtml, junitReporter, jasmineHelper, compareReporter
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 10000;

  this.async = jasmineHelper.async;
  this.waitForAsync = jasmineHelper.waitForAsync;
  this.compare = jasmineHelper.compare({
    runCompareTests: true,
    compareServer: 'http://jenkins.ux:33334'
  });

  this.roundPathSegments = function(segments) {
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

  var trivialReporter = new jasmine.TrivialReporter();

  jasmineEnv.addReporter(trivialReporter);
  jasmineEnv.addReporter(new jasmine.JUnitXmlReporter('', true, false));
  // passing trivialReporter so we can access the individual DOM nodes
  jasmineEnv.addReporter(new jasmine.CompareReporter(trivialReporter));

  jasmineEnv.specFilter = function(spec) {
    return trivialReporter.specFilter(spec);
  };

  function execJasmine() {
    jasmineEnv.execute();
  }

  if (document.body) {
    setTimeout(execJasmine, 1000);
  } else {
    window.addEventListener('load', execJasmine, false);
  }
});
