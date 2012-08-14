g = new Group().addTo(stage)
  .attr({scale:1})

var logo = 'M173.173,23.565 c5.034,0,8.475,1.461,11.424,5.027c4.299,5.281,4.546,14.249,4.546,28.249'
  +'c0,14.002-0.247,23.094-4.546,28.375c-2.949,3.684-6.631,5.034-11.424,5.034c-2.337,'
  +'0-4.669-0.735-6.51-1.844c-1.353-0.735-3.563-2.825-4.299-4.052v4.913h-12.529'
  +'V1.814c-9.282,0-4.381,21.739-30.465,21.739c5.404,0,10.074,1.105,13.882,5.16c6.266,6.633,5.771,19.774,5.896,31.938h-26.66'
  +'c0,7.367,0.368,13.021,1.964,15.353c0.982,1.474,2.702,2.579,5.039,2.579c2.211,0,3.685-0.982,4.913-2.579'
  +'c0.982-1.227,1.597-3.806,1.597-5.772h12.897c-0.247,5.402-1.721,10.812-5.402,14.864c-3.316,3.682-8.354,5.157-14.005,5.157'
  +'c-6.019,0-10.073-1.35-14.004-5.281c-5.528-5.527-6.019-16.337-6.019-28.13V24.538h-6.263l-14.74,31.812l15.476,32.92H48.123'
  +'l15.234-32.92L48.863,24.538H40.63v64.735H28.225v-4.916c-1.106,1.474-2.826,3.193-4.422,4.053'
  +'c-1.844,1.107-4.176,1.843-6.51,1.843c-5.281,0-8.842-1.597-11.791-5.034c-2.582-2.949-3.687-6.51-3.687-14.005V24.538'
  +'M162.853,28.716c13.161-16.03,34.355,11.972,36.731-4.178v46.676c0,7.495,1.103,11.056,3.682,14.005'
  +'c2.949,3.438,6.51,5.034,11.791,5.034c2.337,0,4.669-0.735,6.513-1.843c1.597-0.856,3.314-2.577,'
  +'4.42-4.053v4.913h12.405V24.538';

Path.rect(10,10,500,300).addTo(g)
  .attr({fillColor:'black'})

new Path(logo).addTo(g)
  .attr({strokeColor: 'white', strokeWidth:4, x:200, y:70, scale:.4});

new Text('Wolfram Kriesing, CTO').addTo(g)
  .attr({fontSize:20, fontFamily:'DIN', x:150, y:150})
  .attr({textFillColor:'white'})
new Text('uxebu Inc.').addTo(g)
  .attr({fontSize:12, fontFamily:'DIN', x:220, y:210})
  .attr({textFillColor:'white'})
new Text('Palo Alto, Munich, Amsterdam').addTo(g)
  .attr({fontSize:8, fontFamily:'DIN', x:195, y:230})
  .attr({textFillColor:'white'})

new Text('+49 174 3004595').addTo(g)
  .attr({fontSize:8, fontFamily:'DIN', x:420, y:280})
  .attr({textFillColor:'white'})
new Text('kriesing@uxebu.com').addTo(g)
  .attr({fontSize:8, fontFamily:'DIN', x:215, y:280})
  .attr({textFillColor:'white'})
new Text('@wolframkriesing').addTo(g)
  .attr({fontSize:8, fontFamily:'DIN', x:40, y:280})
  .attr({textFillColor:'white'})

// back side

Path.rect(10,320,500,300).addTo(g)
  .attr({fillColor:'black'})
Path.rect(30,410,460,190).addTo(g)
  .attr({fillColor:'white'})

new Text('Bonsai – the Flash alternative in pure HTML5').addTo(g)
  .attr({fontSize:12, fontFamily:'DIN', x:120, y:355})
  .attr({textFillColor:'white'})
