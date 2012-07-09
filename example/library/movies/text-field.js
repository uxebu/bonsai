var configurations = [
  {
    text: 'Foo bar [not editable]',
    height: 20
  },
  {
    text: 'This is editable!',
    editable: true,
    password:true, 
    y: 30,
    height: 20
  },
  {
    fillColor: 'pink',
    height: 100,
    wordwrap: true, 
    y: 80
  }, 
  {   
    text: 'Foobarlotsoftextblah blahasdalksdja lsdjalsk dasjdjsald ',
    backgroundColor: 'yellow',
    lineColor: 'red',
    textFillColor: 'green',
    lineWidth: 5,
    height: 70, 
    wordwrap: true,
    y: 200
  }, 
  {
    htmlText: '<i>this</i> <b>is</b> <code>HTML</code>',
    backgroundColor: 'black',
    lineColor: 'blue',
    textFillColor: 'white', 
    lineWidth: 5,
    wordwrap: true,
    y: 290
  }
];
 
  
for (var i = 0, l = configurations.length; i < l; ++i) {
  new TextField('constructor text').attr(configurations[i]).attr({
    width: 200
  }).addTo(stage);
}




