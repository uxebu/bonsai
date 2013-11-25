/**
 * Path w/ events.
 */
var rectPath = bonsai.Path.rect(150, 150, 150, 150).attr({
  fillColor: 'red',
  strokeColor: 'red',
  strokeWidth: 10
});
var colors = [
  'green',
  'blue',
  'yellow',
  'red'
];
var numColors = colors.length;
stage.addChild(rectPath);


rectPath.on('click', function(data){
  var index = counts.click += 1;
  updateCountsText();
  rectPath.attr({fillColor: colors[index % numColors]});
});
rectPath.on('dblclick', function() {
  var index = counts.dblclick += 1;
  updateCountsText();
  rectPath.attr({strokeColor: colors[index % numColors]});
});
rectPath.on('pointerdown', function(data){
  counts.pointerdown++;
  updateCountsText();
});
rectPath.on('pointerup', function(data){
  counts.pointerup++;
  updateCountsText();
});

var t = new Text().attr({x: 100, y: 10});
t.addTo(stage);
var counts = {
  click: 0, dblclick: 0, pointerdown: 0, pointerup: 0
};


function updateCountsText() {
  t.attr({text: 'counts: ' + JSON.stringify(counts)});
}
updateCountsText();
