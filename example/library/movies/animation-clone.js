/**
 * Cloned animations. Note how the cloned animation does not pause along with the original one.
 */
var shape1 = new Rect(0, 50, 100, 100).attr({fillColor: 'red'});
var shape2 = new Rect(0, 200, 100, 100).attr({fillColor: 'green'});
var shape3 = new Rect(0, 350, 100, 100).attr({fillColor: 'blue'});

stage.children([shape1,shape2,shape3]);

var fadeOutAnim = new Animation('3s', { opacity: 0 });



[shape1,shape3].forEach(function(shape) {
  shape.animate(fadeOutAnim.clone());
});
shape2.animate(fadeOutAnim);

setTimeout(function(){
  fadeOutAnim.pause();
  console.log('animation stopped');
}, 1000);

