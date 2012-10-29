/**
 * set
 * 
 * Game by Peter van der Zee
 * (note: does not take "impossible table" into account... yet! ;)
 */

var deck = [];
var selections = [];
var visibleCards = 0;

function start(){
  var newDeck = createDeck();
  deck = [];
  shuffle(newDeck);
  drawTable();
}
function createDeck(){
  var deck = [];
  for (var i=0, len=3*3*3*3; i<len; ++i) {
    deck.push(toCard(i));
  }
  return deck;
}
function shuffle(newDeck){
  while (newDeck.length) deck.push(newDeck.splice(Math.floor(newDeck.length*Math.random()), 1)[0]);
}

function toCard(i){
  return {
    color:Math.floor(i%3),
    shape:Math.floor(i/3)%3,
    fill:Math.floor(i/9)%3,
    count:Math.floor((i/27)%3)+1
  };
}

function drawCard(card,x,y){
  card.x = x;
  card.y = y;
  card.group = new Group().attr({x:x,y:y,cursor:'pointer'}).addTo(stage).on('pointerup', onCardClick(card));
  
  card.bs = new Rect(0,0,50,96,5).stroke('black', 1).addTo(card.group);
  
  if (card.count === 1) {
    createCardShape(card, 17, 40);
  } else if (card.count === 2) {
    createCardShape(card, 17, 27);
    createCardShape(card, 17, 57);
  } else {
    createCardShape(card, 17, 12);
    createCardShape(card, 17, 40);
    createCardShape(card, 17, 68);
  }
  
  ++visibleCards;
  
  return card;
}
function createCardShape(card, x,y){
  var bs = null;
  if (card.shape === 0) bs = new Circle(x+8, y+8, 8);
  else if (card.shape === 1) bs = new Rect(x,y,16,16);
  else bs = new Path().attr({x:x,y:y}).moveTo(8,0).lineTo(16,16).lineTo(0,16).lineTo(8,0);
  
  var color = 'orange';
  if (card.color === 1) color = 'blue';
  else if (card.color === 2) color = 'green';

  var shape = card.shape;
  var fill = card.fill;
  bs.attr({fillColor:fill?color:'', strokeColor:color, strokeWidth:2, opacity:fill===1?.3:1}).addTo(card.group);
  
  return bs;
}

function onCardClick(card){
  return function(){
    if (selections.indexOf(card) >= 0) {
      // deselect card
      card.bs.attr({fillColor: ''});
      selections.splice(selections.indexOf(card), 1);
      
      if (selections.length) selections[0].bs.attr({fillColor:'yellow'});
      if (selections.length>1) selections[1].bs.attr({fillColor:'yellow'});
    } else if (selections.length < 3) {
      selections.push(card);
      card.bs.attr({fillColor: 'yellow'});
      
      if (selections.length === 3) {
        // check if selection conditions hold
        if (isSet(selections[0],selections[1],selections[2])) {
          // replace cards
          selections.forEach(function(s){ s.group.destroy(); })
          
          visibleCards -= 3;
          
          if (!deck.length && !visibleCards) finished();
          if (visibleCards < 12) {
            for (var i=0; i<3 && deck.length; ++i) {
              drawCard(deck.pop(), selections[i].x, selections[i].y);
            }
          }
          
          selections = [];
        } else {
          for (var i=0; i<3; ++i) {
            selections[i].bs.attr({fillColor:'red'});
          }
        }
      }
    }
  };
}
function sameOrUnique(a,b,c){
  if (a === b && b === c) return true;
  if (a !== b && b !== c && a !== c) return true;
  return false;
}
function isSet(a,b,c){
  return (
    sameOrUnique(a.color, b.color, c.color) &&
    sameOrUnique(a.shape, b.shape, c.shape) &&
    sameOrUnique(a.fill, b.fill, c.fill) &&
    sameOrUnique(a.count, b.count, c.count)
  );
}

function drawTable(){
  for (var i=0; i<12; ++i) {
    if (deck.length) drawCard(deck.pop(), 10+(i%3*60), 10+(Math.floor(i/3)*110));
  }
}

function finished(){
  setInterval(function(){
    var bs = drawCard(toCard(Math.floor(Math.random()*81)), 300, 100).group;
    bs
      .animate('2s', {opacity:0})
      .animate('2s', {x:Math.random()*600}, {easing:'bounceIn'})
      .animate('2s', {y:500}, {easing:'bounceOut', onEnd:function(){ bs.destroy(); bs=null; }});
  }, 500);
}

start();