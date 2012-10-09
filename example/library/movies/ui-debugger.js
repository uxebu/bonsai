stage.root.setBackgroundColor('rgba(46,92,135,1)');

var lines = [];
for (var i = 0; i <= 1000; i += 20) {
  lines.push('M0,' + i +'l1000,0 M' + i +',0 l0,1000');
}
new Path(lines.join()).attr({
  strokeColor:'rgba(59,107,153,1)',
  strokeWidth:1
}).addTo(stage);


// ---- movie ----

new Rect(100,100,100,100)
  .addTo(stage)
  .attr({fillColor:"red"});
