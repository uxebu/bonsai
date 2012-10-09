var bs = bonsai;
// colors from http://modernl.com/article/web-2.0-colour-palette
var buttons = [
  {text: 'JavaScript', bgColor:'#CC0000', color: 'white', graphics:{}},
  {text: 'CSS', bgColor:'#4096EE', color: 'white', graphics:{}},
  {text: 'HTML5', bgColor:'#C79810', color: 'white', graphics:{}},
  {text: 'Canvas', bgColor:'#3F4C6B', color: 'white', graphics:{}},
  {text: 'SVG', bgColor:'#73880A', color: 'white', graphics:{}},
  {text: 'WebGL', bgColor:'#D15600', color: 'white', graphics:{}},
  {text: 'Flash', bgColor:'#FF7400', color: 'white', graphics:{}},
];
var stageWidth = 650; // Should be: stage.attr('width');
var stageHeight = 600; // Should be: stage.attr('height');

function renderButton(buttonObj, idx){
  var y = 70 + 50*idx;
  var text = buttonObj.text;
  var bgColor = buttonObj.bgColor;
  var fgColor = buttonObj.color;
  var x = 10;
  var shape1 = new Rect(x, y, 120, 35);
  shape1.attr({fillColor: bgColor, filters:new filter.DropShadow([2,2,2,'black']),
    strokeColor:bs.color(bgColor).darker(0.1), strokeWidth: 5
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

var results = {_sum:0};
function storeResult(group, buttonObj){
  var text = buttonObj.text;
  if (typeof results[text]=='undefined') results[text] = 0;
  results[text]++;
  group.attr({opacity: 0.2});
  group.animate('0.2s', {opacity: 0.8});
  background.update(buttonObj);
  results._sum++;
//  timeGraph.update(buttonObj);
  pieChart.update(buttonObj);
  barChart.update(buttonObj);
}

var background = {};
(function(){
  var lastX = 0;
  var lastY = 60;
  var width = 13;
  var height = 25;
  var bg = new bs.Group();
  new Bitmap('assets/paperbg.png', function() {
    this.attr({y: 0, x: 0, scaleX:1.7, scaleY:2, opacity: 0.5});
    bg.addChild(this, 0);
  });
  stage.addChild(bg);
  new Rect(0, 0, stageWidth, stageHeight)
    .attr({strokeColor:'black', strokeWidth: 1})
    .addTo(bg);
  var counterText = new bs.Text(buttons.length)
    .attr({textFillColor:'black', y:stageHeight-20, x:10,
      fontFamily:'Verdana', fontWeight:'bold'})
    .addTo(bg);
  // Copied from http://openclipart.org/detail/21625/man-by-ericlemerdy
  // License not checked yet!!!
  var man = new bs.Path('M 425.90625,598.78125 L 425.90625,804.0625 L 364.40625,804.0625 L 364.40625,599.53125 L 349.90625,599.53125 L 349.90625,804.0625 L 288.40625,804.0625 L 288.40625,598.78125 L 288.40625,423 L 272.34375,423 L 272.34375,574.0625 L 230.84375,574.0625 L 230.84375,421.78125 C 230.84375,396.84672 251.40922,369.5 276.34375,369.5 L 437.9375,369.5 C 463.34245,369.5 483.4375,398.3763 483.4375,423.78125 L 483.4375,574.0625 L 441.9375,574.0625 L 441.9375,423 L 425.90625,423 L 425.90625,598.78125 z M 357.3125,234.5 C 320.4665,234.5 290.56251,264.40399 290.5625,301.25 C 290.5625,338.096 320.46651,368 357.3125,368 C 394.1585,368 424.06249,338.096 424.0625,301.25 C 424.0625,264.404 394.15852,234.50001 357.3125,234.5 z');
  man.attr({scale:0.2, opacity: 0.5});

  background.update = function(buttonObj){
    counterText.attr('text', results._sum + ' people voted');
    var myMan = man.clone({attributes: true});
    myMan.attr({fillColor:buttonObj.bgColor,
      y: Math.random()*(stageHeight-lastY+height)+lastY,
      x: Math.random()*stageWidth,
      //scale: Math.random() * 3 // That makes it slow!
    });
    bg.addChild(myMan, 1);
    myMan.animate('1s', {x: lastX, y: lastY,
      scale: 0.2,
      scaleX: 0.2, scaleY: 0.2 // Should not be necessary, but above doesnt work.
    });
    // Do a line break.
    lastX += width;
    if (lastX >= stageWidth-width*2){
      lastX = 0;
      lastY += height;
    }
  };
})();

var timeGraph = {};
(function(){
  timeGraph.init = function(buttonObj, idx){
    var group = new bs.Group().attr({x: idx*100, y:idx*10 + 400, opacity: 0.5});
    group.addTo(stage);
    group.__lastDraw = 0;
    buttonObj.graphics.timeGraph = group;
  };

  var counter = 0;
  timeGraph.update = function(buttonObj){
    var group = buttonObj.graphics.timeGraph;
    var attrs = {fillColor: buttonObj.bgColor};
    var text = buttonObj.text;
    var line = new Rect(group.__lastDraw, 110, counter-group.__lastDraw, -results[text]);
    line.attr(attrs);
    group.addChild(line);
    group.__lastDraw = counter;
    counter++;
  };
})();

var pieChart = {};
(function(){
  var pos = {x:stageWidth-100, y:250};
  var group = new bs.Group();
  pieChart.init = function(){
    // Add a circle with a drop shadow behind the pie chart, so it looks like the pie chart has a dropshadow
    new Circle(pos.x, pos.y, 59)
      .attr({fillColor:'black', strokeWidth:1, strokeColor: 'white',
             filters: new filter.DropShadow([5,5,5,'grey'])})
      .addTo(group);
    stage.addChild(group);
  };

  var arcs = [];
  pieChart.update = function(){
    var sum = results._sum;
    arcs.forEach(function(arc){ group.removeChild(arc); });
    var startAngle = 0;
    buttons.forEach(function(b){
      var count = results[b.text];
      if (!count) return;
      var endAngle = startAngle+count/sum * Math.PI*2;
      arcs.push(bs.Path.arc(pos.x, pos.y, 30, startAngle, endAngle)
        .attr({strokeWidth:60, strokeColor:b.bgColor})
        .addTo(group)
      );
      startAngle = endAngle;
    });
  };
})();

var barChart = {};
(function(){

  function bar3d(color, x, y, width, height){
    var darker = bs.color(color).darker(0.1);
    var group = new Group();
    new Rect(x, y, width, height)
      .attr({fillColor: color,
        fillGradient: bs.gradient.linear('right', [
          [darker.darker(0.05), 0],
          [color, 15],
          [color, 50],
          [darker, 85],
          [darker.darker(0.1), 100]
        ])
      })
      .addTo(group);
    new Rect(x + width*0.2, y, width*0.1, height)
      .attr({fillColor: 'white', opacity: 0.6,
        filters: new filter.Blur(2)})
      .addTo(group);
    bs.Path.arc(x + width*0.5, y, width/2, 0, Math.PI)
      .attr({fillColor: 'white', opacity: 0.3, scaleY: 0.2, origin: {x:0, y:y}})
      .addTo(group);
    return group;
  }

  var positions = [];
  var group = new Group();
  barChart.init = function(b){
    positions.push(b.text);
    group.addTo(stage);
  }

  var bars = {};
  barChart.update = function(b){
    var text = b.text;
    var pos = positions.indexOf(text);
    var height = results[text]*3;
    var bar = bar3d(b.bgColor, 40*pos+20, stageHeight-height-30, 30, height);
    bars[text] && bars[text].removeChild();
    bar.addTo(group);
    bars[text] = bar;
  }
})();

(function(){
  var maxWidth = stageWidth;
  var group = new Group()
    .attr({x:0, y:0, clip:new Rect(0, 0, maxWidth, 50)})
    .addTo(stage);
  var line = new Path().moveTo(0, 50)
    .addTo(group)
    .attr({strokeColor:'black', strokeWidth:3});
  var count = 1;
  var lastSum = 0;
  function heartBeat(){
    var x = 7*count++;
    var num = results._sum-lastSum;
    line.lineTo(x, 50 - num*3);
    if (x>maxWidth) line.attr({x: -(x-maxWidth)});
    lastSum = results._sum;
  }
  setInterval(heartBeat, 100);
})();


buttons.forEach(timeGraph.init);
buttons.forEach(barChart.init);
buttons.forEach(pieChart.init);
buttons.forEach(renderButton); // Buttons are on top.

// Generate clicks
var interval = setInterval(function(){
  buttons.forEach(function(b){
    if ((b.text=='Flash' && Math.random()>.1)
      || (b.text.indexOf('C')>-1 && Math.random()>.4)
      || Math.random()>.7) return;
    storeResult(b.graphics.buttonGroup, b);
    storeResult(b.graphics.buttonGroup, b);
  });
}, 100);
setTimeout(function(){ clearInterval(interval)  }, 3000);
//*/
