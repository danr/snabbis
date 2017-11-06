# snabbis

> An opinionated domain specific language for snabbdom.

## API overview
* Content
* tag
* module Content
  * id
  * classes
  * classed
  * styles
  * style
  * attrs
  * key
  * on
  * on_
  * hook
  * props
  * dataset
* patch
* init
* h
* VNode
* VNodeData
## Documentation
* **Content**: `typeof Content`

  
* **tag**: `(tag_name_and_classes_and_id: string, ...content: Array<Content>) => vnode.VNode`

  Make a VNode

  ```typescript
  toHTML(tag('span#faq.right'))
  // => '<span id="faq" class="right"></span>'
  ```

  ```typescript
  toHTML(tag('table .grid12 .tiny #mainTable'))
  // => '<table id="mainTable" class="grid12 tiny"></table>'
  ```

  You can nest tags and use strings for text:

  ```typescript
  toHTML(
  tag('div',
    'Announcement: ',
    tag('span', 'hello'), ' ',
    tag('span', 'world')))
  // => '<div>Announcement: <span>hello</span> <span>world</span></div>'
  ```

  It's ok to pass arrays:

  ```typescript
  const arr = ['apa', 'bepa']
  toHTML(tag('div', arr.map(e => tag('span', e))))
  // => '<div><span>apa</span><span>bepa</span></div>'
  ```

  You may also pass booleans, undefined and null and those will be filtered out:

  ```typescript
  const arr = ['apa', 'bepa']
  toHTML(
  tag('div',
     arr[0] == 'apa' || 'first',
     arr[1] == 'apa' || 'second',
     arr[2]))
  // => '<div>second</div>'
  ```

  The other kinds of content to the tag function is documented by their respective function.

  Note: this documentation has imported `snabbis` like so:

  ```typescript
  import { tag, Content as S } from 'snabbis'
  ```

  Feel free to rename `tag` or `S` to whatever you feel beautiful.

  The documentation also uses `toHTML` from the `snabbdom-to-html` package:

  ```typescript
  const toHTML = require('snabbdom-to-html')
  ```

  The documentation alos uses `VNode` from `snabbdom` which is reexported by `snabbis` for convenience:

  ```typescript
  import { VNode } from 'snabbis'
  ```
### module Content


* **id**: `(id: string) => Content`

  Set the id

  ```typescript
  toHTML(tag('div', S.id('root')))
     // => '<div id="root"></div>'
  ```
* **classes**: `(classes: Record<string, boolean>) => Content`

  Set some classes

  ```typescript
  toHTML(tag('div', S.classes({example: true})))
     // => '<div class="example"></div>'
  ```

  ```typescript
  toHTML(tag('div', S.classes({nav: true, strip: true}), S.classes({'left-side': true})))
     // => '<div class="nav strip left-side"></div>'
  ```

  ```typescript
  toHTML(tag('div', S.classes({nav: true}), S.classes({nav: false})))
     // => '<div></div>'
  ```
* **classed**: `(c: string) => Content`

  Set one class

  ```typescript
  toHTML(tag('div', S.classed('navbar')))
     // => '<div class="navbar"></div>'
  ```
* **styles**: `(styles: VNodeStyle) => Content`

  Set some styles

  ```typescript
  toHTML(tag('div', S.styles({display: 'inline-block', textTransform: 'uppercase'})))
     // => '<div style="display: inline-block; text-transform: uppercase"></div>'
  ```
* **style**: `(k: string, v: string) => Content`

  Set one style

  ```typescript
  toHTML(tag('div', S.style('display', 'inline-block')))
     // => '<div style="display: inline-block"></div>'
  ```
* **attrs**: `(attrs: Record<string, string | number | boolean>) => Content`

  Set some attributes

  ```typescript
  toHTML(tag('div', S.attrs({example: 1})))
     // => '<div example="1"></div>'
  ```

  ```typescript
  toHTML(tag('div', S.attrs({a: 1, b: 2}), S.attrs({c: 3})))
     // => '<div a="1" b="2" c="3"></div>'
  ```

  ```typescript
  toHTML(tag('div', S.attrs({a: 1}), S.attrs({a: 2})))
     // => '<div a="2"></div>'
  ```
* **key**: `(key: string | number) => Content`

  Set the key, used to identify elements for sorting and css animations

  ```typescript
  tag('div', S.key('example_key')).key
     // => 'example_key'
  ```
* **on**: `<N extends "abort" | "activate" | "beforeactivate" | "beforecopy" | "beforecut" | "beforedeactivate" | "beforepaste" | "blur" | "canplay" | "canplaythrough" | "change" | "click" | "contextmenu" | "copy" | "cuechange" | "cut" | "dblclick" | "deactivate" | "drag" | "dragend" | "dragenter" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "ended" | "error" | "focus" | "input" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadstart" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "mousewheel" | "MSContentZoom" | "MSManipulationStateChanged" | "paste" | "pause" | "play" | "playing" | "progress" | "ratechange" | "reset" | "scroll" | "seeked" | "seeking" | "select" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "volumechange" | "waiting" | "ariarequest" | "command" | "gotpointercapture" | "lostpointercapture" | "MSGestureChange" | "MSGestureDoubleTap" | "MSGestureEnd" | "MSGestureHold" | "MSGestureStart" | "MSGestureTap" | "MSGotPointerCapture" | "MSInertiaStart" | "MSLostPointerCapture" | "MSPointerCancel" | "MSPointerDown" | "MSPointerEnter" | "MSPointerLeave" | "MSPointerMove" | "MSPointerOut" | "MSPointerOver" | "MSPointerUp" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "webkitfullscreenchange" | "webkitfullscreenerror" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "wheel">(name: N) => (h: (e: HTMLElementEventMap[N]) => void) => Content`

  Insert an event handler which is in the `HTMLElementEventMap`

  ```typescript
  tag('div',
       S.on('keydown')((e: KeyboardEvent) => {
         console.log('You pressed', e.char)})
     ).data.on.keydown !== undefined
     // => true
  ```
* **on_**: `(name: string, h: (e: Event) => void) => Content`

  Insert an event handler with any name

  ```typescript
  tag('div',
       S.on_('keydown', (e: Event) => {
         console.log('You pressed', (e as KeyboardEvent).char)})
     ).data.on.keydown !== undefined
     // => true
  ```
* **hook**: `(hook: Hooks) => Content`

  Insert a `snabbdom` hook

  ```typescript
  tag('div',
       S.hook({
         insert: (vn: VNode) =>
           console.log('inserted vnode', vn, 'associated with dom element', vn.elm)})
     ).data.hook.insert !== undefined
     // => true
  ```
* **props**: `(props: Record<string, any>) => Content`

  Set some properties (ambient data attached to dom nodes)

  ```typescript
  tag('div', S.props({example: 1})).data.props
     // => {example: 1}
  ```

  ```typescript
  tag('div', S.props({a: 1, b: 2}), S.props({c: 3})).data.props
     // => {a: 1, b: 2, c: 3}
  ```

  ```typescript
  tag('div', S.props({a: 1}), S.props({a: 2})).data.props
     // => {a: 2}
  ```
* **dataset**: `(dataset: Record<string, string>) => Content`

  Set data attribute

  ```typescript
  tag('div', S.dataset({foo: 'bar'})).data.dataset.foo
     // => 'bar'
  ```
* **patch**: `(oldVnode: vnode.VNode | Element, vnode: vnode.VNode) => vnode.VNode`

  
* **init**: `(modules: Array<Partial<Module>>, domApi?: DOMAPI) => (oldVnode: vnode.VNode | Element, vnode: vnode.VNode) => vnode.VNode`

  
* **h**: `{ (sel: string): vnode.VNode; (sel: string, data: vnode.VNodeData): vnode.VNode; (sel: string, text: string): vnode.VNode; (sel: string, children: Array<vnode.VNode>): vnode.VNode; (sel: string, data: vnode.VNodeData, text: string): vnode.VNode; (sel: string, data: vnode.VNodeData, children: Array<vnode.VNode>): vnode.VNode; }`

  
* **VNode**: `undefined`

  Convenience reexport of `snabbdom`'s `VNode`
* **VNodeData**: `undefined`

  Convenience reexport of `snabbdom`'s `VNodeData`
