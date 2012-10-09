/**
 * Tests a simple group with late addition / subtraction of children.
 *
 * First box should become visible after a second,
 * second box should become visible after another second.
 * first box should disappear after another second.
 * second box should disappear after another second.
 */

var group = new Group();

var shape1 = new Rect(10,10,100,100).attr({fillColor: 'red'});
group.addChild(shape1);

setTimeout(function(){
  stage.addChild(group);
}, 1000);

setTimeout(function(){
  var shape2 = new Rect(50,50,100,100).attr({fillColor: 'blue'});
  group.addChild(shape2);
}, 2000);

setTimeout(function(){
  group.removeChild(shape1);
}, 3000);

setTimeout(function(){
  stage.removeChild(group);
}, 4000);
