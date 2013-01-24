define(function() {
  var complexRunData = {
    urls: ['assets/red_box.js', 'assets/yellow.js'],
    code: function() {

      new Rect(100, 0, 100, 100).addTo(stage).attr({
        fillColor: 'blue'
      });

      redBoxFromPlugin().addTo(stage);

      new Movie('green.js', function(err, subMovie) {
        if (err) {
          console.log('Error: ' + err);
          return;
        }
        subMovie.attr({
          x: 100,
          y: 100,
          origin: new Point(50, 50)
        }).addTo(stage);
        tools.forEach(stage.children(), function(child) {
          child.animate('4s', {
            rotation: Math.PI * 2
          }, {
            repeat: Infinity
          })
        });
        new Bitmap('redpanda.jpg', function(err) {
          if (err) {
            console.log('Error: ' + err);
            return;
          }
          this.addTo(stage).attr({
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            opacity: 0
          }).animate('.5s', {
              opacity: 1
            });
          stage.sendMessage('success', {done: true});
        });
      });
    }
  };
  return {
    complexRunData: complexRunData
  }
});