# Bonsai

(previously known as *bikeshedjs*)

 > *The art of bonsai tells a story through living illusion. A bonsai artist searches for ways to express his personal creativity by mixing form and thought in a miniature world.* [*[source]*](http://whatijustlearned.wordpress.com/2011/04/22/bonsai-heaven-and-earth-in-one-container/)

### Introduction

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

### An example

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
