/**
 * Shape w/ events.
 */
var rectShape = bonsai.Shape.rect(150, 150, 150, 150).attr({fillColor: 'red'});
var colors = [
  'green',
  'blue',
  'yellow',
  'red'
];
var index = 0;

stage.addChild(rectShape);

rectShape.on('click', function(data){
  if (++index == colors.length) index = 0;
  rectShape.attr({fillColor: colors[index]});
});
