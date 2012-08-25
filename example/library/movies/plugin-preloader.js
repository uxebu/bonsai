var failingPanda = new Bitmap('assets/redpandaa.jpg');
var paperbg = new Bitmap('assets/paperbg.png');
var redpanda = new Bitmap('assets/redpanda.jpg');

new Preloader([failingPanda, paperbg, redpanda], function(displayObjects) {
  tools.forEach(displayObjects, function(displayObject) {
    if (!(displayObject instanceof Error)) {
      displayObject.addTo(stage);
    }
  });
});
