var movie = new bonsai.Movie();

stage.addChild(movie);

var dict = [

function shape_1() { // DefineShape4
  var s = new bonsai.Shape().moveTo(81, 79).attr({
    lineWidth: 1,
    lineColor: 0x000000ff,
    cap: 'round',
    join: 'round'
  }).lineBy(339.95, 0)
  return s;
}

];

var byDepth = {};

var frames = [

function frame_0() {
  movie.clear();
  var o = byDepth[1] = new dict[0];
  movie.addChild(o);
}

]

movie.frames(frames);
