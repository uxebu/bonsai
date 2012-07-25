/**
 * Path w/ events.
 */
var rectPath = bonsai.Path.rect(150, 150, 150, 150).attr({fillColor: 'red'});
var colors = [
  'green',
  'blue',
  'yellow',
  'red'
];
var index = 0;

stage.addChild(rectPath);

rectPath.on('click', function(data){
  if (++index == colors.length) index = 0;
  rectPath.attr({fillColor: colors[index]});
});
