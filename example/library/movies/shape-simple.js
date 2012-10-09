/**
 * Tests a simple shape creation.
 */

// new Rect returns a {DisplayObject}
var rectPath = new Rect(150, 150, 150, 150);

// add [DisplayObjectInstance] to [Stage]
stage.addChild(rectPath.attr({strokeWidth:1, fillColor:'red', opacity:0.4}));

// full circle
stage.addChild(new Circle(52, 52, 50).attr({fillColor: 'red', strokeWidth:1, strokeColor: 'yellow'}));

// half circle
stage.addChild(
	new Arc(202, 52, 50, Math.PI/2, Math.PI)
		.attr({fillColor: 'red', strokeWidth:1, strokeColor: 'green'})
		.attr({x:140,y:30})
);

// half circle
stage.addChild(new Path('M40,140 L40,100 L10,100 C10,10 90,10 90,100 L60,100 L60,140 M140,50 C70,180 195,180 190,100 z').attr({fillColor: 'blue', strokeWidth: 1}));
