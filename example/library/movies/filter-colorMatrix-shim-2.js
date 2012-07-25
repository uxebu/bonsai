var testPath = Path.rect(100,100,100,100)
  .addTo(stage)
  .attr({
    fillColor:"red"
  });

setTimeout(function(){
  testPath.attr({
    fillColor: 'green'
  });
},1000);

setTimeout(function(){
  testPath.attr({
    filters: filter.colorMatrix([
        1, 1, 1, 0, 0,
        1, 0.7, -1, 0, 0,
        -1, -1, -1, 0, 0,
        0, 0, 0, 1, 0
      ])
  });
},2000);

setTimeout(function(){
  testPath.attr({
    fillColor: 'black'
  });
},3000);

setTimeout(function(){
  testPath.attr({
    fillColor: 'white'
  });
},4000);
