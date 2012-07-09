new Text('Fontilicious').addTo(stage).attr({
  fontFamily: new FontFamily('FLORLRG', [
    'assets/FLORLRG_FONT/FLORLRG_-webfont.woff',
    'assets/FLORLRG_FONT/FLORLRG_-webfont.eot',
    'assets/FLORLRG_FONT/FLORLRG_-webfont.ttf',
    'assets/FLORLRG_FONT/FLORLRG_-webfont.svg'
  ]),
  fontSize: 60,
  x: 50,
  y: 100
});

var oath = new Text().attr({
  x: 50,
  y: 200,
  fontSize: 40
}).addTo(stage);

var komikax = new FontFamily('KOMIKAX', [
  'assets/KOMIKAX_FONT/KOMIKAX_-webfont.woff',
  'assets/KOMIKAX_FONT/KOMIKAX_-webfont.eot',
  'assets/KOMIKAX_FONT/KOMIKAX_-webfont.ttf',
  'assets/KOMIKAX_FONT/KOMIKAX_-webfont.svg'
]);

new TextSpan('I').addTo(oath).attr('fontFamily', 'KOMIKAX');
new TextSpan(' swear').addTo(oath).attr('fontFamily', 'monospace');
new TextSpan(' allegiance').addTo(oath).attr('fontFamily', 'FLORLRG');
new TextSpan(' to').addTo(oath).attr('fontFamily', 'monospace');
new TextSpan(' JavaScript').addTo(oath).attr('fontFamily', 'KOMIKAX');