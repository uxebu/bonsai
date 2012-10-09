/**
 * Animation events
 */

var shape1 = new Rect(0, 50, 100, 100).attr({fillColor: 'red'});
var shape2 = new Rect(0, 200, 100, 100).attr({fillColor: 'green'});

stage.children([shape1,shape2]);

var onEnd = function(animation) { console.log('animation ended'); };
var onStart = function(animation) { console.log('animation started'); };

// explicit listener
var anim = new Animation('1s', { x: 300 });
anim.on('play', onStart);
anim.on('end', onEnd);
shape1.animate(anim);

// via options
shape2.animate('2s', { x: 300 }, { onEnd: onEnd, onPlay: onStart});
