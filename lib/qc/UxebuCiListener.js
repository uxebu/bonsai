define([
  'HtmlListener'
],function(HtmlListener) {
  /**
   * Enhance the HtmlListener a bit, to set the testsComplete flag when done, which
   * the uxebu CI env needs to be informed when all test are done and needs to get
   * the test results passed.
   */
  var testResults = { passed: [], failure: [] };
  var UxebuCiListener = function(){
    HtmlListener.apply(this, arguments); // Call the parent constructor.
  };
  UxebuCiListener.prototype = new HtmlListener({});

  var lastType = '';
  var lastResultName = '';

  UxebuCiListener.prototype.noteResult = function (result) {
    lastResultName = result.name;
    HtmlListener.prototype.noteResult.apply(this, arguments); // Call parent method.
  }

  UxebuCiListener.prototype.passed = function (str) {
    HtmlListener.prototype.passed.apply(this, arguments); // Call parent method.
    testResults.passed.push(str);
    lastType = 'passed';
  }

  UxebuCiListener.prototype.failure = function (str) {
    HtmlListener.prototype.failure.apply(this, arguments); // Call parent method.
    testResults.failure.push(lastResultName + ': ' + str);
    lastType = 'failure';
  }

  UxebuCiListener.prototype.log = function (str) {
    HtmlListener.prototype.log.apply(this, arguments); // Call parent method.
    if (lastType=='failure'){
      var arr = testResults[lastType];
      arr[arr.length-1] += ''+str;
    }
  }

  UxebuCiListener.prototype.done = function (str) {
    HtmlListener.prototype.done.apply(this, arguments); // Call parent method.
    window.JUnitTestResults = [{'filename':'qc.js', 'text':generateJunitTestResults()}];
    window.testsComplete = true;
  };

  var generateJunitTestResults = function(){

    var testCases = [];
    for (var i=0, l=testResults.passed.length; i<l; i++){
      var r = testResults.passed[i];
      testCases.push('<testcase classname="{{TAG}}.qc.js" name="' + r.name.replace(/["<>]/, '') + '" time="0"></testcase>');
    }
    for (var i=0, l=testResults.failure.length; i<l; i++){
      var r = testResults.failure[i];
      testCases.push('<testcase classname="{{TAG}}.qc.js" name="' + r.replace(/["<>]/, '') + '" time="0">' +
        '<failure message="????">STACKTRACE</failure>'+
        '</testcase>');
    }

    var numTests = testResults.passed.length + testResults.failure.length;
    return '<?xml version="1.0" encoding="UTF-8" ?>'+
      '<testsuites>'+
        '<testsuite name="{{TAG}}.qc.js" errors="0" '+
                  'tests="' + numTests + '" failures="' + testResults.failure.length + '" time="23.42" timestamp="2011-11-11T17:28:30">'+
          testCases.join("\n") +
        '</testsuite>'+
      '</testsuites>';
  }

  return UxebuCiListener;
});
