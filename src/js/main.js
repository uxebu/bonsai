define([
  'order!jquery/jquery',
  'order!jquery/xdr',
  'order!modules/placeholder',
  'modules/legacy',
  'pages/all'
], function(_a, _b, _c, _d, all) {
  all.init();

  // Init page specific modules
  var pageName = document.body.getAttribute('data-page-name');
  var callb = function(module) {
    module.init();
  };

  switch (pageName) {
    case 'home':
      require(['pages/home'], callb);
      break;
  }
});
