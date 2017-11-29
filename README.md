# snabbis

> An opinionated domain specific language for snabbdom.

## API overview
* attach
* tag
* module s
  * id
  * classes
  * classed
  * style
  * css
  * attrs
  * key
  * on
  * on_
  * hook
  * hooks
  * props
  * dataset
  * input
  * checkbox
  * button
  * textarea
  * select
* TagData
* h
* VNode
* VNodeData
* Patch
* module tags
  * factory
  * div
  * span
  * p
  * pre
  * em
  * strong
  * b
  * i
  * u
  * strike
  * small
  * table
  * tbody
  * thead
  * tfoot
  * tr
  * td
  * th
  * h1
  * h2
  * h3
  * h4
  * h5
  * h6
  * li
  * ul
  * ol

## Documentation
* **attach**: `<S>(root: HTMLElement, init_state: S, setup_view: (store: Store<S>) => () => vnode.VNode, patch?: Patch) => (setup_next_view: (store: Store<S>) => () => vnode.VNode) => void`

  Attach a view to a reactive lens store initialized at some state.

  Suggested usage:

  ```typescript
  import * as App from "./App"
  import * as snabbis from "snabbis"
  const root = document.getElementById('root') as HTMLElement
  const reattach = snabbis.attach(root, App.init(), App.App)

  declare const module: any;
  declare const require: any;

  if (module.hot) {
    module.hot.accept('./App.ts', (_: any) => {
      try {
        const NextApp = require('./App.ts')
        reattach(NextApp.App)
      } catch (e) {
        console.error(e)
      }
    })
  }
  ```

  Returns the reattach function. 
* **tag**: `(tag_name_classes_id: string, ...tag_data: Array<TagData>) => vnode.VNode`

  Make a VNode

  ```typescript
  toHTML(tag('span#faq.right'))
  // => '<span id="faq" class="right"></span>'
  ```

  ```typescript
  toHTML(tag('table .grid12 .tiny #mainTable'))
  // => '<table id="mainTable" class="grid12 tiny"></table>'
  ```

  ```typescript
  toHTML(tag('.green'))
  // => '<div class="green"></div>'
  ```

  You can use strings for text:

  ```typescript
  toHTML(tag('span', 'Loreen ispun'))
  // => '<span>Loreen ispun</span>'
  ```

  You can nest tags:

  ```typescript
  toHTML(tag('span', 'Announcement: ', tag('em', 'hello world'), '!')
  // => '<span>Announcement: <em>hello world</em>!</span>'
  ```

  You can pass arrays:

  ```typescript
  const arr = ['apa', 'bepa']
  toHTML(tag('div', arr.map(e => tag('span', e))))
  // => '<div><span>apa</span><span>bepa</span></div>'
  ```

  You may also pass booleans, undefined/null and those will be filtered out:

  ```typescript
  const x = 1
  const y = 2
  const largest = [x > y && 'x largest', x < y && 'y largest']
  toHTML(tag('span', largest))
  // => '<span>y largest</span>'
  ```

  ```typescript
  const d = {b: 3, c: 4}
  toHTML(tag('span', d['a'], d['b']))
  // => '<span>3</span>'
  ```

  The other kinds of content to the tag function are documented by their respective function.

  Note: this documentation has imported `snabbis` like so:

  ```typescript
  import { tag, s } from 'snabbis'
  ```

  Feel free to rename `tag` or `s` to whatever you feel beautiful, example:

  ```typescript
  import { tag as h } from 'snabbis'
  ```

  The documentation also uses `toHTML` from the `snabbdom-to-html`.
### module s


* **id**: `(id: string) => TagData`

  Set the id

  ```typescript
     toHTML(tag('div', s.id('root')))
     // => '<div id="root"></div>'
  ```
* **classes**: `(classes: Record<string, boolean>) => TagData`

  Set some classes

  ```typescript
     toHTML(tag('div', s.classes({example: true})))
     // => '<div class="example"></div>'
  ```

  ```typescript
     toHTML(tag('div', s.classes({nav: true, strip: true}), s.classes({'left-side': true})))
     // => '<div class="nav strip left-side"></div>'
  ```

  ```typescript
     toHTML(tag('div', s.classes({nav: true}), s.classes({nav: false})))
     // => '<div></div>'
  ```
* **classed**: `(...classnames: Array<string>) => TagData`

  Set one or more classes

  ```typescript
     toHTML(tag('div', s.classed('navbar')))
     // => '<div class="navbar"></div>'
  ```

  ```typescript
     toHTML(tag('div', s.classed('colourless', 'green', 'idea', 'sleeping', 'furious')))
     // => '<div class="colourless green idea sleeping furious"></div>'
  ```

  Since you cannot have class names with spaces, the string is split on whitespace:

  ```typescript
     toHTML(tag('div', s.classed(' colourless green idea sleeping  furious ')))
     // => '<div class="colourless green idea sleeping furious"></div>'
  ```

  Whitespace-only strings vanish:

  ```typescript
     toHTML(tag('div', s.classed('', ' ')))
     // => '<div></div>'
  ```
* **style**: `(styles: VNodeStyle) => TagData`

  Set some styles

  ```typescript
     toHTML(tag('div', s.style({display: 'inline-block', textTransform: 'uppercase'})))
     // => '<div style="display: inline-block; text-transform: uppercase"></div>'
  ```
* **css**: `(styles: VNodeStyle) => TagData`

  
* **attrs**: `(attrs: Record<string, string | number | boolean>) => TagData`

  Set some attributes

  ```typescript
     toHTML(tag('div', s.attrs({example: 1})))
     // => '<div example="1"></div>'
  ```

  ```typescript
     toHTML(tag('div', s.attrs({a: 1, b: 2}), s.attrs({c: 3})))
     // => '<div a="1" b="2" c="3"></div>'
  ```

  ```typescript
     toHTML(tag('div', s.attrs({a: 1}), s.attrs({a: 2})))
     // => '<div a="2"></div>'
  ```
* **key**: `(key: string | number) => TagData`

  Set the key, used to identify elements when diffing

  ```typescript
     tag('div', s.key('example_key')).key
     // => 'example_key'
  ```
* **on**: `<N extends "abort" | "activate" | "beforeactivate" | "beforecopy" | "beforecut" | "beforedeactivate" | "beforepaste" | "blur" | "canplay" | "canplaythrough" | "change" | "click" | "contextmenu" | "copy" | "cuechange" | "cut" | "dblclick" | "deactivate" | "drag" | "dragend" | "dragenter" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "ended" | "error" | "focus" | "input" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadstart" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "mousewheel" | "MSContentZoom" | "MSManipulationStateChanged" | "paste" | "pause" | "play" | "playing" | "progress" | "ratechange" | "reset" | "scroll" | "seeked" | "seeking" | "select" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "volumechange" | "waiting" | "ariarequest" | "command" | "gotpointercapture" | "lostpointercapture" | "MSGestureChange" | "MSGestureDoubleTap" | "MSGestureEnd" | "MSGestureHold" | "MSGestureStart" | "MSGestureTap" | "MSGotPointerCapture" | "MSInertiaStart" | "MSLostPointerCapture" | "MSPointerCancel" | "MSPointerDown" | "MSPointerEnter" | "MSPointerLeave" | "MSPointerMove" | "MSPointerOut" | "MSPointerOver" | "MSPointerUp" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "webkitfullscreenchange" | "webkitfullscreenerror" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "wheel">(event_name: N) => (h: (e: HTMLElementEventMap[N]) => void) => TagData`

  Insert an event handler which is in the `HTMLElementEventMap`

  ```typescript
     tag('div',
       s.on('keydown')((e: KeyboardEvent) => {
         console.log('You pressed', e.char)})
     ).data.on.keydown !== undefined
     // => true
  ```
* **on_**: `(event_name: string, h: (e: Event) => void) => TagData`

  Insert an event handler with any name

  ```typescript
     tag('div',
       s.on_('keydown', (e: Event) => {
         console.log('You pressed', (e as KeyboardEvent).char)})
     ).data.on.keydown !== undefined
     // => true
  ```
* **hook**: `<N extends "pre" | "init" | "create" | "insert" | "prepatch" | "update" | "postpatch" | "destroy" | "remove" | "post">(hook_name: N) => (h: Hooks[N]) => TagData`

  Insert a `snabbdom` hook

  ```typescript
     tag('div',
       s.hook('insert')(
         (vn: VNode) =>
           console.log('inserted vnode', vn, 'associated with dom element', vn.elm)})
     ).data.hook.insert !== undefined
     // => true
  ```
* **hooks**: `(hooks: Hooks) => TagData`

  Insert `snabbdom` hooks

  ```typescript
     tag('div',
       s.hooks({
         insert: (vn: VNode) =>
           console.log('inserted vnode', vn, 'associated with dom element', vn.elm)})
     ).data.hook.insert !== undefined
     // => true
  ```
* **props**: `(props: Record<string, any>) => TagData`

  Set some properties (ambient data attached to dom nodes)

  ```typescript
     tag('div', s.props({example: 1})).data.props
     // => {example: 1}
  ```

  ```typescript
     tag('div', s.props({a: 1, b: 2}), s.props({c: 3})).data.props
     // => {a: 1, b: 2, c: 3}
  ```

  ```typescript
     tag('div', s.props({a: 1}), s.props({a: 2})).data.props
     // => {a: 2}
  ```
* **dataset**: `(dataset: Record<string, string>) => TagData`

  Set data attribute

  ```typescript
     tag('div', s.dataset({foo: 'bar'})).data.dataset.foo
     // => 'bar'
  ```
* **input**: `(store: Store<string>, onEnter?: () => void, ...tag_data: Array<TagData>) => vnode.VNode`

  
* **checkbox**: `(store: Store<boolean>, ...tag_data: Array<TagData>) => vnode.VNode`

  
* **button**: `(onClick: () => void, label?: string, ...tag_data: Array<TagData>) => vnode.VNode`

  
* **textarea**: `(store: Store<string>, rows?: number, cols?: number, ...tag_data: Array<TagData>) => vnode.VNode`

  
* **select**: `(stored: Store<string>, keys: Store<Array<string>>, option: (key: string, index: number) => vnode.VNode, ...tag_data: Array<TagData>) => vnode.VNode`

  
* **TagData**: `undefined`

  Content to put in a `tag` 
* **h**: `{ (sel: string): vnode.VNode; (sel: string, data: vnode.VNodeData): vnode.VNode; (sel: string, text: string): vnode.VNode; (sel: string, children: Array<vnode.VNode>): vnode.VNode; (sel: string, data: vnode.VNodeData, text: string): vnode.VNode; (sel: string, data: vnode.VNodeData, children: Array<vnode.VNode>): vnode.VNode; }`

  
* **VNode**: `undefined`

  Convenience reexport of `snabbdom`'s `VNode` 
* **VNodeData**: `undefined`

  Convenience reexport of `snabbdom`'s `VNodeData` 
* **Patch**: `undefined`

  The type of a snabbdom patch, create one with snabbdom.init 
### module tags

Common tags

Example usage:

```typescript
import { tags } from "snabbis"
const {div, span, h1} = tags
```
* **factory**: `(name: string) => (...tag_data: Array<TagData>) => vnode.VNode`

  
* **div**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **span**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **p**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **pre**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **em**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **strong**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **b**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **i**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **u**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **strike**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **small**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **table**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **tbody**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **thead**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **tfoot**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **tr**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **td**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **th**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **h1**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **h2**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **h3**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **h4**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **h5**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **h6**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **li**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **ul**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
* **ol**: `(...tag_data: Array<TagData>) => vnode.VNode`

  
