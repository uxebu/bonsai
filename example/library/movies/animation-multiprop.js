/**
 * Animated attributes
 */
var rectShape = bonsai.Shape.rect(50, 50, 100, 100).attr({fillColor: 'red', lineColor: 'green', lineWidth: 5});

stage.addChild(rectShape);

rectShape.animate(
  '3s',
{
  x: 300,
  y: 300,
  opacity: 0
}, {
  easing: 'linear'
});
