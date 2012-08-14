var rainbow = Path.rect(0, 0, 480, 480).attr({
  strokeWidth: 1,
  fillGradient: gradient.linear(90,
    ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
  )
}).addTo(stage);

var mask = Path.circle(240, 240, 50).attr({
  fillGradient: gradient.radial([['#FFF', 50],'#000'], 50)
});

rainbow.attr('mask', mask);

open();

function open() {
  mask.animate('1s', {
    scaleX: 10
  }, {
    onEnd: function() {
      mask.animate('2s', {
        scaleY: 10
      }, {
        onEnd: close
      })
    }
  });
}

function close() {
  mask.animate('2s', {
    scaleY: 1
  }, {
    onEnd: function() {
      mask.animate('1s', {
        scaleX: 1
      }, {
        onEnd: open
      })
    }
  });
}
