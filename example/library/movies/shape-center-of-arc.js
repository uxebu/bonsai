// http://www.w3.org/TR/SVG11/implnote.html#ArcSyntax

var abs = Math.abs;
var pow = Math.pow;
var sqrt = Math.sqrt;
var cos = Math.cos;
var sin = Math.sin;
var PI = Math.PI;
var max = Math.max;

function centerFromArc(x1, y1, rx, ry, angle, large, sweep, x2, y2) {

  // Any nonzero value for either of the flags large or sweep is taken to mean the value 1
  large = !!large;
  sweep = !!sweep;

  // degrees to rad
  angle = max((angle * PI) / 180, 0.0001);

  function step2Helper(rxPow, ryPow, x1_Pow, y1_Pow) {
    return sqrt((rxPow * ryPow - rxPow * y1_Pow - ryPow * x1_Pow) / (rxPow * y1_Pow + ryPow * x1_Pow));
  }

  // step 1: compute (x1′, y1′)
  var x1_ = cos(angle) * sin(angle) * ((x1 - x2) / 2);
  var y1_ = -sin(angle) * cos(angle) * ((y1 - y2) / 2);
  // step 2: compute (cx′, cy′)
  var rxPow = pow(rx, 2);
  var ryPow = pow(ry, 2);
  var x1_Pow = pow(x1_, 2);
  var y1_Pow = pow(y1_, 2);
  //+ sign is chosen if large ≠ sweep, and the − sign is chosen if large = sweep
  var sign = large === sweep ? -1 : 1;
  var cx_ = sign * (step2Helper(rxPow, ryPow, x1_Pow, y1_Pow) * ((rx  * y1_) / ry));
  var cy_ = sign * (step2Helper(rxPow, ryPow, x1_Pow, y1_Pow) * ((ry * x1_) / rx));

  // step 3: compute (cx, cy) from (cx′, cy′)
  var cx = (cos(angle) * -sin(angle)) * cx_ + ((x1 + x2) / 2);
  var cy = (sin(angle) * cos(angle)) * cy_ + ((y1 + y2) / 2);

  return {
    x: cx,
    y: cy
  };
}

exampleArcs = [
  'M 50 200 a 100 50 0 1 1 250 50',
  'M 50 80 a 100 50 30 1 1 250 50',
  'M 300 100 a 100 50 30 1 1 250 50',
  'M 400 300 a 100 50 45 1 1 250 50',
  'M 150 600 a 100 50 135 1 1 250 50',
  "M 300 350 a 150 50 0 0 0 250 50",
  "M 500 750 a 150 50 0 0 1 250 50",
  "M 550 600 a 150 50 0 1 0 250 50",
  "M 700 450 a 150 50 0 1 1 250 50"
  ];

for (var i = 0; i < exampleArcs.length; i++) {
  var shape = new Path(exampleArcs[i]).
  attr('strokeColor', 'black').attr('strokeWidth', 1).addTo(stage);

  // convert segments to absolute and strip of the numbers
  var a = (Path.toAbsolute(shape.segments()).join(",").split(",")).filter(function(e) {
   return !isNaN(+e);
  });

// calc center of an arc
  var c = centerFromArc(+a[0], +a[1], +a[2], +a[3], +a[4], +a[5], +a[6], +a[7], +a[8]);
  // draw center of an arc
  new Circle(c.x, c.y, 5).attr('fillColor', 'red').addTo(stage);
}
