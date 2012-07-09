/**
 * Tests a simple group
 */

var displayObject = new bonsai.Shape.rect(10,10,100,100).attr({fillColor: 'red'});
stage.addChild(displayObject);

setTimeout(function() {
  stage.removeChild(displayObject);
}, 1500);
