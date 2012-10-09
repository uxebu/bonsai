/**
 * Tests layering. The yellow box should appear below the green box.
 */
var example1  = new Group().addTo(stage).attr({x: 10, y: 10});
var shape1 = new Rect(0, 0, 100, 100).attr({fillColor: 'red'});
var shape2 = new Rect(25,25, 100, 100).attr({fillColor: 'green'});
var shape3 = new Rect(50, 50, 100, 100).attr({fillColor: 'yellow'});

example1.addChild(shape1);
example1.addChild(shape2);
example1.addChild(shape3, 1);


/**
 * Tests layering. The orange box should appear below the red and blue box.
 */
var example2 = new Group().addTo(stage).attr({x: 210, y: 10});
var red = new Rect(0,0,100,100).attr('fillColor', 'red');
var blue = new Rect(25,25,100,100).attr('fillColor', 'blue');
var orange = new Rect(50,50,100,100).attr('fillColor', 'orange');

example2.addChild([red,blue], 5);
example2.addChild(orange, 5);


/**
 * Tests layering. The blue square should appear below the red one after one second.
 */
var example3 = new Group().addTo(stage).attr({x: 410, y: 10});
var red = new Rect(0,0, 100, 100).attr('fillColor', 'red');
var blue = new Rect(25, 25, 100, 100).attr('fillColor', 'blue');

example3.addChild(red, 3);
example3.addChild(blue, 5);

example3.animate('1s', {}, {
 onEnd: function() {
  example3.removeChild(blue);
  example3.addChild(blue, 1);
 }
});
