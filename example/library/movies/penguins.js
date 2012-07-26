/*
 * A more complex movie example.
 *
 * Contains multiple "layers", different drag handling,
 * UI controls, object selection, zooming and other
 * stuff.
 *
 */

function range(value, min, max){
  return Math.min(max, Math.max(min, value));
}
var x,y;
var app = {

  layers: {
    controls: null,
    canvas: null
  },

  scale: 1,

  controls: {},

  items: [],

  focusedItem: null,

  init: function(){
    this.layers.canvas = this.setupCanvas().addTo(stage);
    this.layers.controls = this.setupControls().addTo(stage);
  },

  setupControls: function(){
    var controlLayer = new bonsai.Group();

    // background
    bonsai.Path.rect(0,0,400,35).attr({
      fillColor: 'rgba(0,0,0,0.2)',
      filters: 'blur',
      strokeWidth: 1
    }).addTo(controlLayer);

    new bonsai.Text('Penguins:').attr({
      x: 20,
      y: 10,
      fontSize: 20
    }).addTo(controlLayer);

    this.controls.addButton = new bonsai.Text('+').attr({
      x: 110,
      y: 0,
      fontSize: 40
    }).addTo(controlLayer).on('pointerdown', function(){
      app.addItem();
    });

    this.controls.removeButton = new bonsai.Text('-').attr({
      x: 150,
      y: 0,
      fontSize: 40
    }).addTo(controlLayer).on('pointerdown', function(){
      app.removeFocusedItem();
    });

    new bonsai.Text('Zoom:').attr({
      x: 200,
      y: 10,
      fontSize: 20
    }).addTo(controlLayer);

    this.controls.zoomInButton = new bonsai.Text('+').attr({
      x: 270,
      y: 0,
      fontSize: 40
    }).addTo(controlLayer).on('pointerdown', function(){
      app.scale *= 1.2;
      app.layers.canvas.attr({ scale: app.scale });
    });

    this.controls.zoomOutButton = new bonsai.Text('-').attr({
      x: 320,
      y: 0,
      fontSize: 40
    }).addTo(controlLayer).on('pointerdown', function(){
      app.scale *= 0.8;
      app.layers.canvas.attr({ scale: app.scale });
    });

    return controlLayer;
  },

  setupCanvas: function(){
    var canvas = new bonsai.Group();

    var background = this.background = bonsai.Path.rect(0,0, 500, 500).attr({
      x: 0,
      y: 0,
      //filters: 'dropShadow', // massive perf impact :(
      fillColor: 'rgba(73, 182, 73, 1)'
    }).addTo(canvas);

    background.on('pointerdown', function(e) {
      // Catch new x/y at beginning of drag
      x = canvas.attr('x');
      y = canvas.attr('y');
      app.unfocusItem();
    });
    background.on('drag', function(e){
      canvas.attr({
        x: x + e.diffX,
        y: y + e.diffY
      });
    });

    return canvas;
  },

  addItem: function(){
    var item = new bonsai.Bitmap('assets/jester_standard.svg', {
      onload: function() {
        this.attr({
          scale: 0.2,
          filters: new filter.DropShadow([0 , 0, 10, 'black'])
        });
      }
    });
    item.attr({
      x: 190,
      y: 180
    });
    item.highlight = function(){
      //item.attr('fill', fill.lighter(0.13));
    };
    item.unhighlight = function(){
      //item.attr('fill', fill);
    };
    item.on('pointerdown', function(e) {
      // Catch new x/y at beginning of drag
      x = this.attr('x');
      y = this.attr('y');
      app.focusItem(this);
    });
    item.on('drag', function(e){
      this.attr({
        x: range(x + e.diffX / app.scale, -40, 390),
        y: range(y + e.diffY / app.scale, -50, 350)
      });
    });
    item.on('mouseover', function() {
      this.highlight();
    });
    item.on('mouseout', function() {
      if(app.focusedItem != this) {
        this.unhighlight();
      }
    });
    item.addTo(this.layers.canvas);
    //this.items.push(item);
  },

  removeFocusedItem: function(){
    var item = app.focusedItem;
    if (!item) {
      return;
    }
    app.focusedItem = null;
    item.remove();
  },

  focusItem: function(item){
    if(this.focusedItem){
      this.unfocusItem();
    }
    this.focusedItem = item;
    item.attr({
      filters: new filter.DropShadow([0 , 0, 10, 'yellow'])
    });
  },

  unfocusItem: function(){
    var item = app.focusedItem;
    if (!item) {
      return;
    }
    item.unhighlight();
    item.attr({
      filters: new filter.DropShadow([0 , 0, 10, 'black'])
    });
    this.focusedItem = null;
  }
};

app.init();
