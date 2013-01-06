# Bonsai

(previously known as *bikeshedjs*)

 > *The art of bonsai tells a story through living illusion. A bonsai artist searches for ways to express his personal creativity by mixing form and thought in a miniature world.* [*[source]*](http://whatijustlearned.wordpress.com/2011/04/22/bonsai-heaven-and-earth-in-one-container/)

## Introduction

Bonsai is a JavaScript graphics library. For the finer details, see the [documentation](http://docs.bonsaijs.org) (currently in construction).

Bonsai's main features include:

 * Architecturally separated runner and renderer
 * iFrame, Worker and Node running contexts
 * Shapes
 * Paths
 * Assets (Videos, Images, Fonts, SubMovies)
 * Keyframe and regular animation (easing functions too)
 * Shape/path morphing
 * *and much more*...

## An example

Draw a `100x200` rectangle to the stage at `{0,0}`:

```js
var r = new Rect(0, 0, 100, 200).addTo(stage);
```

Fill it:

```js
r.fill('red');
```

Change your mind... make it darker:

```js
r.fill( color('red').darker() );
```

Animate it:

```js
r.animate('400ms', {
  x: 50,
  y: 50,
  width: 200
});
```

See more here: [Bonsai Documentation/Overviews](http://docs.bonsaijs.org) or
join the IRC channel [#bonsaijs on freenode](http://webchat.freenode.net/?channels=bonsaijs) and ask for help.

## Tooling (Grunt)

We use [Grunt](http://gruntjs.com) for testing, linting and building BonsaiJS releases.

### Prerequisites

* [Node.js / NPM](http://nodejs.org) `>= 0.8.0` (on OSX: `brew install node`)
* [Closure Compiler](https://code.google.com/p/closure-compiler) (on OSX: `brew install closure-compiler`

### Setup

First you need to setup Grunt for this project:

~~~ bash
npm install -g grunt-cli grunt-init # install grunt packages globally
npm install # in the cloned BonsaiJS directory to install required Node.js packages
~~~

You also need Closure Compiler to be installed and the environment variable `CLOSURE_PATH` to be set
(see https://github.com/gmarty/grunt-closure-compiler#getting-started for details):

~~~ bash
# on OSX
echo "export CLOSURE_PATH=\"`brew --prefix closure-compiler`/libexec\"" >> ~/.bash_profile
# or when downloaded from https://code.google.com/p/closure-compiler/downloads/list and installed to CLOSURE_PATH
export CLOSURE_PATH=~/closure-compiler
wget https://closure-compiler.googlecode.com/files/compiler-latest.tar.gz
mkdir -p $CLOSURE_PATH/build
tar xzvf compiler-latest.tar.gz -C compiler/build
echo "export CLOSURE_PATH=\"$CLOSURE_PATH\"" >> ~/.bash_profile # `~/.profile` on Windows (using MINGW)
~~~

### Executing tests

Tests can easily be executed through PhantomJS:

~~~ bash
grunt test
~~~

If you want to execute tests in your browser do the following:

~~~ bash
grunt run-server
open http://localhost:8001/_spec_runner.html
~~~
