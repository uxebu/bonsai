## Layered Renderer

**Note**: The layered renderer is unfinished and was merely intended as a prototype to see how it would work. The idea was to eventually have many different types of layers, each perfect for handling specific types of display-objects. E.g. There could be a CanvasLayer to handle gradients or images etc.

The Renderer class takes care of drawing all DisplayObjects, including Bitmaps, DOMElements, paths etc.

The actual DOM output of the renderer is defined by the DisplayObject structure of the movie.

The outline of an empty movie is:

 * DisplayGroup
   * SVGLayer -- *This is just used for storing things to refer to*
     * SVGElement (Group) -- Blank group
     * SVGElement (Defs) -- Pattern, Gradients, etc.

The movie's DOM hierarchy is characterised by various Display classes. These classes have the following inheritance structure:

```
                      DisplayElement
                  _____|     |    |_______
                 /           |            \
             DisplayLayer   SVGElement    DOMElement
            /     |      \
DisplayGroup   DOMLayer  SVGLayer
```

 * DisplayElement: Any Element to be displayed (has a `parentDisplayGroup` and `parentDisplayLayer`)
   * DisplayLayer: A layer can be a parent to other Display Elements
     * DisplayGroup: A group that contains other layers or gruops
     * DOMLayer: A layer which only contains DOM Elements
     * SVGLayer: A layer which only contains SVG Elements
   * SVGElement: Any SVG Element (e.g. `path` or `g`) that exists within an SVGLayer
   * DOMElement: Any DOM Element (e.g. `div` or `em`) that exists within a DOMLayer

----

Here's the process of the renderer rendering a `Path` DisplayObject with an ID of 1 which is a child of the stage (ID:0):

 1. Create a new instance of SVGElement passing in a new SVG `Path` Element
 2. Assign it to `rendererInstance.display[1]` (i.e. the ID of the DisplayObject)
 3. Call `drawPath` passing the SVGElement's raw DOM (a `SVGPathElement` instance)
 4. Call `drawAll` passing the SVGElement's raw DOM (a `SVGPathElement` instance)
 5. Apply attributes via `rendererInstance.display.attr()`
 6. Its parent, the stage, is a DisplayObject, and SVGElements cannot be appended to
    DisplayGroups so we create a new SVGLayer, and append that to the stage DisplayGroup
 7. Our path SVGElement is then appended to the SVGLayer

SVGLayer and DOMLayer are only renderer concerns. They do not have IDs. We use layers
to contain and separate DOM Elements, SVG Elements, and DisplayGroups.

E.g. 

If a DOMElement needs to be added after an SVGElement, the renderer will create a new
DOMLayer and insert it after the SVGElement's parentLayer (an SVGLayer).

See the [hierarchy tests](https://github.com/uxebu/bonsai/blob/layered-renderer/test/renderer/layered_renderer/layered_renderer_hierarchy-spec.js#L121) -- these should give you a good overview of what DOM structures are outputted by the renderer.














