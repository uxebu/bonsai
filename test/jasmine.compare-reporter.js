(function() {

  if (! jasmine) {
    throw new Exception("jasmine library does not exist in global namespace!");
  }

  function elapsed(startTime, endTime) {
    return (endTime - startTime)/1000;
  }

  /**
   * Adds screenshot-compare-server results to the resulting HTML
   *
   * @param {jasmine.TrivialReporter} reporter that writes to DOM. Used for appending
   *                  screenshot results
   */
  var CompareReporter = function(domReporter) {
    this.domReporter = domReporter;
  };

  CompareReporter.prototype = {
    reportSpecResults: function(spec) {
      var data = spec.env.compareResults[spec.id];
      var dom = this.domReporter;
      var specNode = this.domReporter.suiteDivs[spec.suite.id].querySelectorAll('.spec');
      specNode = specNode[specNode.length-1];

      if(data && specNode) {
        var table = dom.createDom('table', null, 
          dom.createDom('tbody', null,
            dom.createDom('tr', null,
              dom.createDom('th', null, 'Variant 1'),
              dom.createDom('th', null, 'Variant 2'),
              dom.createDom('th', null, 'Diff'),
              dom.createDom('th', null, 'Greyscale Diff'),
              dom.createDom('th', null, 'XOR Diff'),
              dom.createDom('th', null, 'AE'),
              dom.createDom('th', null, 'MAE'),
              dom.createDom('th', null, 'PSNR'),
              dom.createDom('th', null, 'RMSE')
            ),
            dom.createDom('tr', null,
              dom.createDom('td', null, dom.createDom('img', {src: data.screenshot1}, '')),
              dom.createDom('td', null, dom.createDom('img', {src: data.screenshot2}, '')),
              dom.createDom('td', null, dom.createDom('img', {src: data.diff}, '')),
              dom.createDom('td', null, dom.createDom('img', {src: data.greyDiff}, '')),
              dom.createDom('td', null, dom.createDom('img', {src: data.xorDiff}, '')),
              dom.createDom('td', null, data.ae + ""),
              dom.createDom('td', null, data.mae + "", dom.createDom('br'), data.mae_n + "%"),
              dom.createDom('td', null, data.psnr + ""),
              dom.createDom('td', null, data.rmse + "", dom.createDom('br'), data.rmse_n + "%")
            )
          )
        );
        specNode.appendChild(table);
      }
    },
    log: function(str) {
      this.domReporter.log(str);
    }
  };

  // export public
  jasmine.CompareReporter = CompareReporter;
})();
