/**
 * text metrics
 */

function drawBox(txt) {
  var x = 100, fontSize = 20, y = txt.attr('y');
  new Rect(x, y-fontSize, 0, 2*fontSize).stroke('red', 1).addTo(stage);
  new Rect(x-50, y, 100, 0).stroke('blue', 1).addTo(stage);
  txt.attr('x', x).attr('fontSize', fontSize).addTo(stage);
}

drawBox(new Text('top left (default)').attr({
  y:50
}));

drawBox(new Text('center left').attr({
  y:120,
  textOrigin:'center'
}));

drawBox(new Text('bottom right').attr({
  y:190,
  textOrigin:'bottom'
}));

drawBox(new Text('center center').attr({
  y:260,
  textOrigin:'center',
  textAlign:'center'
}));
