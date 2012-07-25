stage.on('multi:pointerdown', function(e) {
  var s = Path.circle(e.stageX, e.stageY, Math.random() * 50 + 50)
    .attr({
      fillColor: 'random'
    })
    .addTo(stage)
    .animate('1s', {
      scaleX: 0,
      scaleY: 0,
      opacity: 0
    }, {
      onEnd: function() {
        s.remove();
      }
    });
});
