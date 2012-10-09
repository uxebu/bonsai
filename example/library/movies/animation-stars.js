var numStars = 7;
var width = 500;
var height = 500;

var stars = (function(star) {
  var stars = [];
  for (var i = 0; i < numStars; i++) {
    var h = i * 360 / numStars;
    stars[i] = star.clone().attr({
      fillColor: 'hsl(' + h + ', 100%, 50%)',
      x: width / 2,
      y: height / 2
    });
  }

  return stars;
}(new Star(width/2, height/2, 1, 5)));
stage.length(14);

var i = 0;
stage.on(0, function() {
  var star = stars[i];

  star.attr({
    scaleX: 1,
    scaleY: 1,
    opacity: 1
  }).addTo(stage).animate(14 * numStars, {
    scaleX: width * 3,
    scaleY: height * 3,
    opacity: 0
  },{isTimelineBound:false});

  i = (i + 1) % numStars;
  stage.removeChild(stars[i]);
});
