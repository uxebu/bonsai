define([
  'bonsai/runner/path/path'
], function(Path) {
  qc.setTestGroupName('path');

  var gen = qc.generator;
  var numGen = qc.generator.number;
  var opacityPrecision = 1/255;

  var opacityValueGenerator = numGen.floats();

  var attributeGenerator = gen.chooseGenerators(
    gen.arraysOfSize([gen.chooseValue('opacity'), opacityValueGenerator]),
    gen.arraysOfSize([gen.chooseValue('strokeWidth'), numGen.positiveIntegers()])
  );

  function opactiyAssert(testCase, expectedValue, actualValue, precision) {
    precision = precision || opacityPrecision;
    testCase.noteArg(actualValue);
    if (expectedValue < 0) {
      testCase.assert(0 == actualValue);
    } else if (expectedValue > 1) {
      testCase.assert(1 == actualValue);
    } else {
      testCase.assert((((actualValue-precision) <= expectedValue) && ((actualValue+precision) >= expectedValue)));
    }
  }

  qc.declare('get+set various attribute', [attributeGenerator],
    function(testCase, attr) {
      for (var i=0, l=attr.length; i<l; i++) {
        var attrName = attr[i][0];
        var attrValue = attr[i][1];
        var s = new Path();
        s.attr(attrName, attrValue);
        if (attrName.toLowerCase().indexOf('opacity')!=-1) {
          opactiyAssert(testCase, attrValue, s.attr(attrName));
        } else {
          testCase.assert(attrValue == s.attr(attrName));
        }
      }
    }
  );

  qc.declare('get+set opacity', [opacityValueGenerator],
    function(testCase, value) {
      var s = new Path();
      s.attr('opacity', value);
      opactiyAssert(testCase, value, s.attr('opacity'));
    }
  );
});
