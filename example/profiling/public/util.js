var sortBy = function(key) {
  return function(a, b) {
    return b[key] - a[key];
  };
};

// Reduce
var groupBy = function(key) {
  var functions = {};
  return function(memo, node) {
    var id = node[key];
    if (!functions[id]) {
      functions[id] = node;
      return memo.concat(node);
    } else {
      functions[id].selfTime += node.selfTime;
      functions[id].totalTime += node.totalTime;
    }
    return memo;
  };
};

function functionFilter(names) {
  return function(fn) {
    return names.indexOf(fn.functionName) === -1;
  };
}

// Per-item map
function githubifier(blobUrl, functions) {
  return function(fn) {
    if (fn.url && fn.lineNumber)
      fn.github = blobUrl + '/' + fn.url + '#L' + fn.lineNumber;
    return fn;
  };
}

// Per-item map
function encodeId(fn) {
  fn.id = [fn.url, fn.lineNumber, fn.functionName].join(':');
  return fn;
}

var mapFlatten = function(value, keyData, arg) {
  var data = Riak.mapValuesJson(value)[0],
      head = data.head;

  // Flatten tree to list
  function flattenNode(node) {
    return node.children.reduce(function(memo, child) {
      return memo.concat(flattenNode(child));
    }, [node]);
  }

  var profile = flattenNode(head);

  profile.forEach(function(node) {
    // Strip url bases
    node.url = node.url
      .replace('http://jenkins.ux/job/bonsai/ws/', '')
      .replace(/\?.*$/, '');

    // Delete attributes
    delete node.callUID;
    delete node.children;
    delete node.numberOfCalls;
    delete node.visible;
  });

  var index = value.values[0].metadata.index;

  return [{
    key: value.key,
    build: index.build_int,
    rev: index.jobrev_bin,
    time: head.totalTime,
    profile: profile
  }];
};

function mapred(host, inputs, query, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://' + host + '/mapred');
  xhr.send(JSON.stringify({
    inputs: inputs,
    query: query
  }));
  xhr.onload = function() {
    callback(JSON.parse(this.responseText), this);
  };
  return xhr;
}
