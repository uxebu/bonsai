var bs = bonsai;
var buttons = [
  {text: 'JavaScript', bgColor:'blue', color: 'white', graphics:{}},
  {text: 'CSS', bgColor:'red', color: 'white', graphics:{}},
  {text: 'HTML5', bgColor:'green', color: 'white', graphics:{}},
  {text: 'SVG', bgColor:'yellow', color: 'white', graphics:{}},
];
var stageWidth = 750; // Should be: stage.attr('width');
var stageHeight = 600; // Should be: stage.attr('height');
bs.Path.rect(0, 0, stageWidth, stageHeight)
  .attr({strokeColor:'black', strokeWidth: 1})
  .addTo(stage);

function renderButton(buttonObj, idx){
  var y = 100 + 50*idx;
  var text = buttonObj.text;
  var bgColor = buttonObj.bgColor;
  var fgColor = buttonObj.color;
  var x = 300;
  var shape1 = new bonsai.Path.rect(x, y, 120, 35, 5);
  shape1.attr({fillColor: bgColor, filters:filter.dropShadow(2,2,2,'black'),
    strokeColor:bs.color(bgColor).lighter(.2), strokeWidth: 2
  });
  var text = new bonsai.Text(text).attr({
    x: x+10, y: y+10, fontFamily: 'Arial', fontSize: '20px', textFillColor: fgColor
  });
  var group = new bonsai.Group();
  group.addChild(shape1);
  group.addChild(text);
  stage.addChild(group);
  buttonObj.graphics.buttonGroup = group;
  group.on('click', function() { storeResult(this, buttonObj) });
}

var results = {};
function storeResult(group, buttonObj){
  var text = buttonObj.text;
  if (typeof results[text]=='undefined') results[text] = 0;
  results[text]++;
  group.attr({opacity: 0.2});
  group.animate('0.2s', {opacity: 1});
  background.update(buttonObj);
  barChart.update(buttonObj);
  pieChart.update(buttonObj);
}

var background = {};
(function(){
  var lastColor = '';
  var lastX = 0;
  var lastY = 0;
  var width = 9;
  var height = 20;
  var gap = 1;
  background.update = function(buttonObj){
    var bg = new bonsai.Path.rect(lastX, lastY, 1, height).attr({fillColor: buttonObj.bgColor, opacity: 0.2});
    stage.addChild(bg, 0);
    // should be: bg.animate('0.2s', {width: width-1});
    bg.animate('0.2s', {scaleX: width-gap, x: lastX+gap});
    lastX += width;
    if (lastX > stageWidth){
      lastX = 0;
      lastY += height+gap;
    }
  };
})();

var barChart = {};
(function(){
  var charts = {};
  var numCharts = 0;
  var oneHeight = 10;
  barChart.init = function(buttonObj){
    var bar = bs.Path.rect(110 * numCharts, stageHeight-10, 100, oneHeight);
    var gradient = bs.gradient.linear('left', [buttonObj.bgColor, buttonObj.color, buttonObj.bgColor]);
    bar.attr({fillGradient: gradient, opacity: 0.7});
    var text = new bs.Text(buttonObj.text);
    text.attr({x: 110 * numCharts, y: stageHeight-20,
      fontSize: 10, textFillColor: 'black'});
    text.__animated = 0;
    var group = new bs.Group();
    group.addChild(text);
    group.addChild(bar);
    stage.addChild(group);
    buttonObj.graphics.barChartGroup = group;
    numCharts++;
  };

  barChart.update = function(buttonObj){
    var scale = results[buttonObj.text];
    var chart = buttonObj.graphics.barChartGroup.children()[1];
    // should be: chart.animate('1s', {height: results[text]*oneHeight});
    chart.animate('1s', {scaleY: scale, y: stageHeight-10 - (scale-1)*oneHeight});
    // Animate text if bar is high enough
    var textPath = buttonObj.graphics.barChartGroup.children()[0];
    // Should be chart.attr('height')>200
    if (scale*oneHeight > 200 && !textPath.__animated){
      textPath.animate('2s', {x: textPath.attr('x')+20, rotation: -Math.PI/2, fontSize: 30});
      textPath.__animated++;
    }
  };
})();

var pieChart = {};
(function(){
  var charts = {};
  var numCharts = 0;
  var oneHeight = 10;
  var pos = {x:600, y:450};
  var group = new bs.Group();
  pieChart.init = function(buttonObj){
    // Add a circle with a drop shadow behind the pie chart, so it looks like the pie chart has a dropshadow
    bonsai.Path.circle(pos.x, pos.y, 119)
      .attr({fillColor:'black', strokeWidth:1, strokeColor: 'white',
             filters: filter.dropShadow(5,5,5,'grey')})
      .addTo(group);
    stage.addChild(group);
  };

  var arcs = [];
  pieChart.update = function(){
    var sum = 0;
    for (var key in results) sum += results[key];
    arcs.forEach(function(arc){ group.removeChild(arc); });
    var startAngle = 0;
    buttons.forEach(function(b, idx){
      var count = results[b.text];
      if (!count) return;
      var endAngle = startAngle+count/sum * Math.PI*2;
      arcs.push(bs.Path.arc(pos.x, pos.y, 60, startAngle, endAngle)
        .attr({strokeWidth:120, strokeColor:b.bgColor})
        .addTo(group)
      );
      startAngle = endAngle;
    });
  };
})();

buttons.forEach(barChart.init); // Render the bar chart first, so its behind the buttons for sure.
buttons.forEach(pieChart.init);
buttons.forEach(renderButton); // Buttons are on top.

// Generate clicks
var interval = setInterval(function(){
  buttons.forEach(function(b){
    if (Math.random()>.7) return;
    storeResult(b.graphics.buttonGroup, b);
    storeResult(b.graphics.buttonGroup, b);
  });
}, 10);
setTimeout(function(){ clearInterval(interval)  }, 300);
//*/
