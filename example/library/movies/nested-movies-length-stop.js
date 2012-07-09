stage.root.setFramerate(1);

var movies = {};

function createMovie(name, length, parent, addStop){
  var _movie = movies[name] = new Movie().addTo(parent);
  var _text = new Text('').attr({
    fontSize: '20px',
    fontFamily: 'Arial',
    x: 50,
    y: 50 * Object.keys(movies).length
  }).addTo(_movie);
  var _frames = [];
  for(var i=0; i<length; i++){
    _frames.push(function(){
      _text.clear().addChild(
        new TextSpan(name + ': frame ' + (_movie.currentFrame + 1) + '/' + length
      ));
    });
  }
  if(addStop){
    var oldFunc = _frames[length - 1];
    _frames[length - 1] = function(){
      oldFunc();
      _movie.stop();
    }
  }
  _movie.frames(_frames);
  return _movie;
}


var main = createMovie('main', 5, stage, true);
var sub1 = createMovie('sub1', 10, main);



