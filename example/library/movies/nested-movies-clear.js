stage.root.setFramerate(1);

var movies = {};
var frames = {};
var texts = {};

function createMovie(name, length, parent, addStop){
  var _movie = movies[name] = new Movie();
  parent && _movie.addTo(parent);

  var _frames = frames[name] = [];
  for(var i=0; i<length; i++){
    _frames.push(function(){
      console.log(name, _movie.currentFrame);

      if(_movie.currentFrame === 0){

        // as in transwf, we clear the movie on frame 0:
        console.log('clearing movie ' + name);
        _movie.clear();

        // now setup the text:
        texts[name] = new Text('').attr({
          fontSize: '20px',
          fontFamily: 'Arial',
          x: 50,
          y: 50 * (name == 'main' ? 1 : 2)
        }).addTo(_movie);
      }

      // in all frames, update text:
      texts[name].clear().addChild(
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
  if(parent){
    _movie.frames(_frames);
  }
  return _movie;
}

// create main, but don't attach yet:
var main = createMovie('main', 5, null);

// now, add a submovie in frame 4:
frames['main'][3] = function(){
 createMovie('sub1', 10, main);
 texts['main'].clear().addChild(
    new TextSpan('main: frame 4/5')
  );
}

// now, set frames and attach:
movies['main'].frames(frames['main']);
stage.addChild(main);

