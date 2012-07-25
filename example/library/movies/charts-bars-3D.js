var bs = bonsai

bs.Path.rect(0, 0, 600, 600)
  .attr({fillColor: 'grey'})
  .addTo(stage)

function bar3d(color, x, y, width, height){
  var darker = bs.color(color).darker(0.1);
  bs.Path.rect(x, y, width, height)
    .attr({fillColor: color,
      fillGradient: bs.gradient.linear('right', [
        [darker.darker(0.05), 0],
        [color, 15],
        [color, 50],
        [darker, 85],
        [darker.darker(0.1), 100]
      ])
    })
    .addTo(stage);

  bs.Path.rect(x + width*0.2, y, width*0.1, height)
    .attr({fillColor: 'white', opacity: 0.6,
      filters: new filter.Blur(2)})
    .addTo(stage);

  bs.Path.arc(x + width*0.5, y, width/2, 0, Math.PI)
    .attr({fillColor: 'white', opacity: 0.3, scaleY: 0.2, origin: {x:0, y:y}})
    .addTo(stage);
}

// color, x, y, width, height
bar3d('red', 100, 100, 100, 300);
bar3d('blue', 210, 200, 100, 200);
bar3d('green', 320, 120, 100, 280);
bar3d('yellow', 430, 250, 100, 150);
