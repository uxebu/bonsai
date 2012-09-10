  DisplayObject.prototype.pulse = function pulse(duration, from, to, easing) {
    var self = this;
    go();
    function go() {
      self.animate(duration, typeof to == 'function' ? to() : to, {
        onEnd: function() {
          self.animate(duration, typeof from == 'function' ? from() : from, {
            onEnd: go,
            easing: 'sineInOut'
          })
        },
        easing: 'sineInOut'
      });
    }
    return this;
  };

  var spaceship = new Bitmap(assets.spaceship).attr({
    width: 500,
    height: 450,
    x: 240,
    y: 5
  });
  var planet = new Bitmap(assets.planet).attr({
    x: 215,
    y: 20,
    height: 430,
    width: 500,
    origin: new Point(250, 215)
  });
  var downloadShip = new Bitmap(assets.downloadShip).attr({
    x: 490,
    y: 50,
    height: 200,
    width: 500
  });
  var flyingSaucer = new Bitmap(assets.flyingSaucer).attr({
    x: 400,
    y: -9,
    height: 150,
    width: 200,
    origin: new Point(180, 20)
  });
  var orbit = new Bitmap(assets.orbit).attr({
    x: 91,
    y: 170,
    height: 300,
    width: 800,
    origin: new Point(400, 150)
  });
  var satellite = new Bitmap(assets.satellite).attr({
    x: 60,
    y: 150,
    height: 70,
    width: 120,
    origin: new Point(60, 35)
  });

  stage.children([
    flyingSaucer,
    planet,
    orbit,
    spaceship,
    downloadShip,
    satellite
  ]);

  planet.pulse('1s', {
    rotation: 0,
    scale: 1,
    y: 20
  }, {
    rotation: .03,
    scale: 1.02,
    y: 25
  }, 'sineInOut');

  orbit.pulse('1s', {
    scale: 1
  }, {
    scale: 1.02
  }, 'sineInOut');

  satellite.pulse('1s', {
    rotation: 1.6,
    scale: 1
  }, {
    rotation: 2,
    scale: 1.2
  });
/*
  flyingSaucer.pulse('.5s', {
    rotation: 0
  }, function() {
    return {
      rotation: Math.random() * -.5
    }
  }, 'bounceOut');

*/