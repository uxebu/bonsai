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
  counts.click++;
  updateCountsText();
  if (++index == colors.length) index = 0;
  rectPath.attr({fillColor: colors[index]});
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
  click: 0, pointerdown: 0, pointerup: 0
};


function updateCountsText() {
  t.attr({text: 'counts: ' + JSON.stringify(counts)});
}
updateCountsText();
