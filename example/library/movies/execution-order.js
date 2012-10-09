var movie = new Movie();
var movieName = "root";

var dictionary = {

  "3": function Sprite_3() {
    var movie = new Movie();
    var movieName = "Sprite_3";

    var frames = {
      "0": function frame_0() {
        console.log('entering frame 0 of child movie');
        // VM  ops:
        // This is where the AS3 ctor is called, and the frame connections are
        // made. If the child movie does not have a special class defined in
        // SymbolClass, everything is fine.
        movie.on('runframescripts', function(){ console.log('standard child movie frame script executing'); })

        // now, as a last thing in this frame, call scripts registered for this frame
        console.log('emitting event for attached scripts (child movie, frame 0)');
        movie.emit('runframescripts', this, movie.currentFrame);

        // done, leaving frame
        console.log('leaving frame 0 of child movie');
      },
      "1": function() {
        movie.stop();
      }
    };

    movie.frames(frames);
    movie.__characterId__ = 3;
    return movie;
  }
};

var byDepth = {};

var frames =

{
  "0": function frame_0() {
    console.log('entering frame 0 of parent movie');

    // getting a child movie from the dictionary and adding it to the stage
    console.log('getting child movie');
    var item = dictionary["3"]();
    console.log('adding it to stage');
    movie.addChild(item, 1);

    // VM and SymbolClass ops:
    // This is where the AS3 gets executed, and where frame scripts for the main
    // movie are attached.
    movie.on('runframescripts', function(){ console.log('parent movie frame script executing'); })


    // Sadly, this _can_ also be the place, where frame scripts for child movies
    // are attached - if they have a special symbol class. You won't see the
    // following appear in the console if you are on the instant-play branch.
    item.on('runframescripts', function(){ console.log('special child movie frame script executing'); })

    // now, as a last thing in this frame, call scripts registered for this frame
    console.log('emitting event for attached scripts (parent movie, frame 0)');
    movie.emit('runframescripts', this, movie.currentFrame);

    // done, exiting frame
    console.log('leaving frame 0 of parent movie');
  },
  "1": function() {
    movie.stop();
  }
};


movie.frames(frames);
stage.addChild(movie);


