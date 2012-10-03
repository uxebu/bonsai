/**
 * Sprited Bitmap Implementation
 *
 * @param {String} src Source URL of Sprite image
 * @param {Number} imgWithinSpriteX Location of the target bitmap within the entire
 *  sprite (X)
 * @param {Number} imgWithinSpriteX Location of the target bitmap within the entire
 *  sprite (Y)
 * @param {Number} imgWithinSpriteWidth Width of the target bitmap within the entire
 *  sprite
 * @param {Number} imgWithinSpriteHeight Height of the target bitmap within the entire
 *  sprite
 */
function SpritedBitmap(src, imgWithinSpriteX, imgWithinSpriteY, imgWithinSpriteWidth, imgWithinSpriteHeight) {
  Group.call(this);
  new Bitmap(src).attr({
    x: -imgWithinSpriteX,
    y: -imgWithinSpriteY
  }).addTo(this);
  this.attr(
    'clip',
    new Rect(0, 0, imgWithinSpriteWidth, imgWithinSpriteHeight)
  );
}

SpritedBitmap.prototype = Object.create(Group.prototype);




// Ninja movie:


// IMAGE FROM http://www.36peas.com/blog/2010/9/13/free-japanese-ninja-shinobi-sprite-sheet.html
var src = 'assets/ninja-sprite.jpg';
var ninjas = [
  new SpritedBitmap(src, 0, 0, 95, 140).attr({visible: false}).addTo(stage),
  new SpritedBitmap(src, 92, 0, 95, 140).attr({visible: false}).addTo(stage),
  new SpritedBitmap(src, 188, 0, 95, 140).attr({visible: false}).addTo(stage)
];
var lastIndex = 0;


stage.setFramerate(3);

stage.on('tick', function(s, f) {
  ninjas[lastIndex].attr({visible: false});
  ninjas[lastIndex = f % ninjas.length].attr({visible: true});
});


new Text('Image attributed to http://www.36peas.com/blog/2010/9/13/free-japanese-ninja-shinobi-sprite-sheet.html').addTo(stage).attr({y: 200, x: 20})