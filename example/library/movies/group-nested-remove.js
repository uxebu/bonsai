/**
 * Tests nested groups with late addition / subtraction of children.
 *
 * First three boxes should become visible after a second,
 * Fourth box should become visible after another second.
 * First three boxes should disappear after another second.
 * Fourth box should disappear after another second.
 */

var group = new bonsai.Group();

var shape1 = new bonsai.Shape.rect(10,10,100,100).attr({fillColor: 'red'});
group.addChild(shape1);


var group2 = new bonsai.Group();
[
  bonsai.Shape.rect(20,20,100,100).attr({fillColor:'green'}),
  bonsai.Shape.rect(30,30,100,100).attr({fillColor:'yellow'}),
  bonsai.Shape.rect(40,40,100,100).attr({fillColor:'gray'})
].forEach(function(obj){
  group2.addChild(obj);
});
group.addChild(group2);


setTimeout(function(){
  stage.addChild(group);
}, 1000);

setTimeout(function(){
  var shape2 = new bonsai.Shape.rect(50,50,100,100).attr({fillColor: 'blue'});
  group.addChild(shape2);
}, 2000);

setTimeout(function(){
  group.removeChild(shape1);
}, 3000);

setTimeout(function(){
  stage.removeChild(group);
}, 4000);
