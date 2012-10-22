/* create rect and add it to the stage immediately */
var rect1 = new Rect(0,0,100,100).attr({ fillColor: 'red' });
stage.addChild(rect1);

/* create rect and add it to movie immediately, but do not add movie for now */
var movie = new Movie();
var rect2 = new Rect(0,0,100,100).attr({ fillColor: 'green', x: 10, y: 10 });
movie.addChild(rect2);

/* frames() execution only starts after movie is added to stage */
movie.frames({
    30: function() {
        rect2.animate('1s', {
            x: 100,
            y: 100
        });
    }
});

/* add movie to stage after one second */
stage.frames({
    '1s': function() {
        stage.addChild(movie);
    }
});
