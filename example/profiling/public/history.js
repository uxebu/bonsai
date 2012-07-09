var host     = location.host,
    view     = document.getElementById('view');

google.load('visualization', '1', {packages:['corechart']});
google.setOnLoadCallback(loadTestuidFromHash);

function getProfiles(host, key, callback) {
  if (this.lastReq)
    this.lastReq.abort()

  var inputs = {
    bucket: 'profile',
    index: 'testuid_bin',
    key: key
  };

if (key !== 'nodeprofile') {
  var query = [
    { map: { language: 'javascript', source: mapFlatten.toString() } }
  ];
} else {
  var query = [
    { map: { language: 'javascript', source: nodeMapFlatten.toString() } }
  ];
}

  this.lastReq = mapred(host, inputs, query, function(response) {
    var keys = response.reduce(function(memo, momo) {
      memo[momo.build] = momo.key;
      return memo;
    }, {});

    var mostRecentProfile = response
      // Sort by build index
      .sort(function(a, b) { return a.build - b.build; })
      // Get most recent profile
      .slice(-1)[0]
      .profile
        // Remove some functions' profiles
        .filter(functionFilter(['(program)', '(anonymous function)']))
        // Sort by selfTime
        .sort(sortBy('selfTime'))
        // Group by function name, summing selfTimes and totalTimes
        .reduce(groupBy('functionName'), []);

    var expensiveFunctions = mostRecentProfile
      .map(function(fn) {
        return fn.functionName;
      });

    var profiles = response
      // Sort by build index
      .sort(function(a, b) { return a.build - b.build; })
      .map(function(value) {
        var functions = {};
        value.profile
          // Group by function name, summing selfTimes and totalTimes
          .reduce(groupBy('functionName'), [])
          // Assign to function hash
          .map(function(fn) {
            functions[fn.functionName] = fn;
          });

        var times = expensiveFunctions
          .map(function(fn) {
            var profile = functions[fn];
            return profile ? Math.round(profile.selfTime) : null;
          });

        return [value.build.toString()].concat(times);
      });

    callback(expensiveFunctions, profiles, keys);
  });
}

function drawChart(functions, profiles, keys) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Build');
  functions.forEach(function(fn) {
     data.addColumn('number', fn);
  });

  data.addRows(profiles);

  var chart = new google.visualization.LineChart(document.getElementById('view'));

  function selectHandler() {
    var selectedItem = chart.getSelection()[0];
    if (selectedItem) {
      var build = data.getValue(selectedItem.row, 0),
          id    = keys[build],
          fn    = data.getColumnLabel(selectedItem.column),
          url   = 'single.html#' + id + '/' + fn;
      location.href = url;
    }
  }

  // Listen for the 'select' event, and call my function selectHandler() when
  // the user selects something on the chart.
  google.visualization.events.addListener(chart, 'select', selectHandler);

  chart.draw(data, {
    allowHtml: true,
    hAxis: { title: 'Build #' },
    title: 'Most expensive functions in recent builds',
    vAxis: { title: 'Total milliseconds per function' }
  });
};

// sidebar
google.load('jquery', '1.7.1');
google.setOnLoadCallback(function () {
  var inputs = {
    bucket: 'profile',
    index: 'job_bin',
    key: 'bonsai'
  };

  var mapTestuid = function(value) {
    return [value.values[0].metadata.index.testuid_bin];
  };

  var query = [
    { map: { language: 'javascript', source: mapTestuid.toString() } },
    { reduce: { language: 'erlang', module: 'riak_kv_mapreduce', function: 'reduce_set_union' }},
    { reduce: { language: 'erlang', module: 'riak_kv_mapreduce', function: 'reduce_sort' }}
  ];

  mapred(host, inputs, query, function(testuids) {
    testuids.forEach(function(testuid) {
      var match = testuid.split('_'),
          job   = match[0],
          test  = match[1],
          rev   = match[2],
          title = test + '<br /><small>' + rev + '</small>',
          link  = $('<a>').html(title).attr('href', '#' + testuid);

      $('<li>')
        .append(link)
        .appendTo($('#testuids'));
  
      link.click(function() {

      });
    })
  });

  $(window).on('hashchange', loadTestuidFromHash);
});

function loadTestuidFromHash() {
  var testuid = location.hash.slice(1);
  if (!testuid) return;
  $('#view').html('Loading ' + testuid + '...');
  getProfiles(host, testuid, drawChart);  
}