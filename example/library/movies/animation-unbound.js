/**
 * Demonstrating the animation's independence of the timeline.
 */
var shape1 = bonsai.Shape.rect(0, 50, 100, 100).attr({fillColor: 'red'});
var shape2 = bonsai.Shape.rect(0, 200, 100, 100).attr({fillColor: 'green'});
var shape3 = bonsai.Shape.rect(0, 350, 100, 100).attr({fillColor: 'blue'});

stage.children([shape1,shape2,shape3]);

var fadeOutAnim = new bonsai.Animation(
  '5s',
  { opacity: 0 },
  { isTimelineBound: false }
);

[shape1,shape2,shape3].forEach(function(shape) {
  shape.animate(fadeOutAnim.clone());
});

setTimeout(function(){
  stage.stop();
  console.log('Movie stopped:', !stage.isPlaying);
}, 1000);
