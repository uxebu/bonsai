var url = 'http://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Friendly_Male_Koala.JPG/220px-Friendly_Male_Koala.JPG';
var bitmap = new Bitmap(url).addTo(stage);

stage.on('tick', function() {
  bitmap.request(url);
});
