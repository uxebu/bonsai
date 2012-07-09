#!/usr/bin/env node

var exec    = require('child_process').exec,
    fs      = require('fs'),
    path    = require('path'),
    profile = require('./lib/profile'),
    url     = require('url');

var argv = require('optimist')
  .usage('Usage: $0 -b [build number] -d [duration] -e [executor url] -r [riak url] [path (defaults to cwd)]')
  .option('build', {
    alias: 'b',
    describe: 'Build number'
  })
  .option('duration', {
    alias: 'd',
    default: 2e3,
    describe: 'Profiling duration (in milliseconds)'
  })
  .option('executor', {
    alias: 'e',
    demand: true,
    describe: 'Test executor URL'
  })
  .option('job', {
    alias: 'j',
    default: 'bonsai',
    describe: 'Name of build job (i.e. bonsai or bonsai-profiling)'
  })
  .option('riak', {
    alias: 'r',
    demand: true,
    describe: 'Riak database URL including bucket to post profiles'
  })
  .argv;

argv.path = argv._.length > 0 ? argv._[0] : __dirname;

function findTestsSync(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return /^test-.*\.js$/.test(file);
  });
}

function getHeadRev(callback) {
  exec('git rev-parse HEAD', function(err, stdout) {
    var rev = stdout.trim();
    callback(rev);
  });
}

function getFileRev(file, callback) {
  exec('git log -1 --pretty=format:%H ' + file, function(err, stdout) {
    var rev = stdout.trim();
    callback(rev);
  });
}

var riakUrl    = url.parse(argv.riak),
    riakHost   = riakUrl.hostname,
    riakPort   = riakUrl.port,
    riakBucket = path.basename(riakUrl.pathname);

var build = argv.build;

var db = require('riak-js').getClient({ host: riakHost, port: riakPort });

var tests = findTestsSync(argv.path);

function profileNext(options) {
  var file = tests.shift();
  if (!file) return;
  getFileRev(path.join(argv.path, file), function(testRev) {
    var duration = argv.duration,
        url      = argv.executor + '?env=iframe&movie=../test/profile/' + file;
    console.log('Profiling ' + url + ' for ' + duration + 'ms');
    profile({
      duration: duration,
      url: url
    }, function(profile) {
      if (!profile || Object.keys(profile).length === 0) {
        console.log('Skipping empty profile for ' + url);
        profileNext(options);
        return;
      }

      var test    = path.basename(file, path.extname(file)),
          testuid = [options.job, test, testRev].join('_'),
          key     = [options.job, argv.build, test, testRev].join('_'),
          meta    = {
            headers: {
              'x-riak-index-build_int': options.build,
              'x-riak-index-job_bin': options.job,
              'x-riak-index-jobrev_bin': options.rev,
              'x-riak-index-test_bin': test,
              'x-riak-index-testuid_bin': testuid,
              'x-riak-index-testrev_bin': testRev
            },
            rev: options.rev
          };

      db.save(riakBucket, key, profile, meta, function(err) {
        if (err) {
          console.err('Error saving ' + key + ': ', err);
          process.exit(1);
        }

        console.log('Saved to ' + argv.riak + '/' + key);
        profileNext(options);
      });
    });
  });
}

getHeadRev(function (rev) {
  var key = [argv.job, build].join('_');
  db.save('build', key, {
    rev: rev
  }, {
    headers: {
      'X-Riak-index-job_bin': argv.job
    }
  }, function(err) {
    if (err) {
      console.log('Could not save build to database:', err);
      process.exit(1);
    }

    var buildUrl = url.format({
      hostname: riakHost,
      pathname: 'riak/build/' + key,
      port: riakPort,
      protocol: 'http'
    });

    console.log('Build posted to ' + buildUrl);

    profileNext({
      build: build,
      job: argv.job,
      rev: rev
    });
  });
});
