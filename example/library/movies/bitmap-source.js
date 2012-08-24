var bitmap = new bonsai.Bitmap('assets/redpanda.jpg').addTo(stage);

stage.frames({
 "2s": function() {
    bitmap.attr({ source: 'assets/paperbg.png'});
 }
});
