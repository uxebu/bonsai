/**
 * Tests a simple group
 */

var shape1 = new Rect(10,10,100,100).attr({fillColor: 'red'});
var group = new Group();
group.addChild(shape1);

stage.addChild(group);
