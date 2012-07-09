/**
 * Tests a simple group
 */

var shape1 = new bonsai.Shape.rect(10,10,100,100).attr({fillColor: 'red'});
var group = new bonsai.Group();
group.addChild(shape1);

stage.addChild(group);
