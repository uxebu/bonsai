/**
 * Tests nested groups with late addition of children
 */

var group = new bonsai.Group();
stage.addChild(group);

// first
var shape1 = new bonsai.Shape.rect(10,10,100,100).attr({fillColor: 'red'});
group.addChild(shape1);

// second
var shape2 = new bonsai.Shape.rect(50,50,100,100).attr({fillColor: 'blue'});
group.addChild(shape2);

// third
var shape3 = new bonsai.Shape.rect(100,100,100,100).attr({fillColor: 'yellow'});
var subgroup = new bonsai.Group();

subgroup.addChild(shape3);

group.addChild(subgroup);


