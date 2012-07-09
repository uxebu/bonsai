/**
 * Animated attributes
 */
var rectShape = bonsai.Shape.rect(0, 0, 150, 150).attr({
  fillColor: 'red',
  lineColor: 'green',
  lineWidth: 5,
  x: 150,
  y: 150
});

stage.addChild(rectShape);

rectShape.animate('2s', {rotation: Math.PI*2}, {easing: 'elasticInOut'});
