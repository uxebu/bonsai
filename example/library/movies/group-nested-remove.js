/**
 * Tests nested groups with late addition / subtraction of children.
 *
 * First three boxes should become visible after a second,
 * Fourth box should become visible after another second.
 * First three boxes should disappear after another second.
 * Fourth box should disappear after another second.
 */

var group = new Group();

var shape1 = new Rect(10,10,100,100).attr({fillColor: 'red'});
group.addChild(shape1);


var group2 = new Group();
[
  new Rect(20,20,100,100).attr({fillColor:'green'}),
  new Rect(30,30,100,100).attr({fillColor:'yellow'}),
  new Rect(40,40,100,100).attr({fillColor:'gray'})
].forEach(function(obj){
  group2.addChild(obj);
});
group.addChild(group2);


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
