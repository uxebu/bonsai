/**
 * event drag
 *
 * Paths w/ drag events.
 */

for (var a = 0; a < 3; ++a) {
  for (var b = 0; b < 3; ++b) {
    (function() {

      var x, y,
          fill = color('red').darker(.1).randomize('hue');

      var r = new Rect(
        a * 150 + 50, b * 150 + 50, 100, 100
      ).attr({
        fillColor: fill
      })
      var g = new Group()
        .on('mouseover', function() {
          this.attr('fillColor', fill.lighter(.2));
        })
        .on('mouseout', function() {
          this.attr('fillColor', fill);
        })
        .on('multi:pointerdown', function(e) {
          // Catch new x/y at beginning of drag
          x = this.attr('x');
          y = this.attr('y');
        })
        .on('multi:drag', function(e){
          this.attr({
            x: x + e.diffX,
            y: y + e.diffY
          });
        })
        .emit('multi:pointerdown')
        .addTo(stage);
      r.addTo(g);

    }());
  }
}
