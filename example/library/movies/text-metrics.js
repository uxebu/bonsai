
function drawText(x, y, origin, text) {
  var t = new Text(text).attr({
    x: x,
    y: y,
    fontSize: '12px',
    fontFamily: 'Arial',
    textOrigin: origin
  });
  new Path()
    .moveTo(0, y)
    .lineTo(1000, y)
    .moveTo(1000, y+12)
    .lineTo(0, y+12)
    .attr({
      strokeWidth: 1,
      strokeColor: 'red'
    })
    .addTo(stage);
  new Path()
    .moveTo(0, y-12)
    .lineTo(1000, y-12)
    .attr({
      strokeWidth: 1,
      strokeColor: 'blue'
    })
    .addTo(stage);
  t.addTo(stage);
}

drawText(100, 50, 'top', 'Hanging text');
drawText(100, 100, '', 'Non-hanging text');
