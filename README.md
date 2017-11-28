# snabbis

> An opinionated domain specific language for snabbdom.

## API overview
* attach
* tag
* module Content
  * id
  * classes
  * classed
  * style
  * attrs
  * key
  * on
  * on_
  * hook
  * hooks
  * props
  * dataset
  * Input
  * Checkbox
  * Button
  * Textarea
  * Select
* Content
* h
* VNode
* VNodeData
* Patch
* module tags
  * factory
  * div
  * span
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
* S

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
  import { tag, S } from 'snabbis'
  ```

  Feel free to rename `tag` or `S` to whatever you feel beautiful.

  The documentation also uses `toHTML` from the `snabbdom-to-html` package:

  ```typescript
  const toHTML = require('snabbdom-to-html')
  ```

  The documentation also uses `VNode` from `snabbdom` which is reexported by `snabbis` for convenience:

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
* **classed**: `(...classnames: Array<string>) => Content`

  Set one or more classes

  ```typescript
     toHTML(tag('div', S.classed('navbar')))
     // => '<div class="navbar"></div>'
  ```

  ```typescript
     toHTML(tag('div', S.classed('colourless', 'green', 'idea', 'sleeping', 'furious')))
     // => '<div class="colourless green idea sleeping furious"></div>'
  ```

  Since you cannot have class names with spaces, the string is split on whitespace:

  ```typescript
     toHTML(tag('div', S.classed(' colourless green idea sleeping  furious ')))
     // => '<div class="colourless green idea sleeping furious"></div>'
  ```

  Whitespace-only strings vanish:

  ```typescript
     toHTML(tag('div', S.classed('', ' ')))
     // => '<div></div>'
  ```
* **style**: `(styles: VNodeStyle) => Content`

  Set some styles

  ```typescript
     toHTML(tag('div', S.style({display: 'inline-block', textTransform: 'uppercase'})))
     // => '<div style="display: inline-block; text-transform: uppercase"></div>'
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

  Set the key, used to identify elements when diffing

  ```typescript
     tag('div', S.key('example_key')).key
     // => 'example_key'
  ```
* **on**: `<N extends "abort" | "activate" | "beforeactivate" | "beforecopy" | "beforecut" | "beforedeactivate" | "beforepaste" | "blur" | "canplay" | "canplaythrough" | "change" | "click" | "contextmenu" | "copy" | "cuechange" | "cut" | "dblclick" | "deactivate" | "drag" | "dragend" | "dragenter" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "ended" | "error" | "focus" | "input" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadstart" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "mousewheel" | "MSContentZoom" | "MSManipulationStateChanged" | "paste" | "pause" | "play" | "playing" | "progress" | "ratechange" | "reset" | "scroll" | "seeked" | "seeking" | "select" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "volumechange" | "waiting" | "ariarequest" | "command" | "gotpointercapture" | "lostpointercapture" | "MSGestureChange" | "MSGestureDoubleTap" | "MSGestureEnd" | "MSGestureHold" | "MSGestureStart" | "MSGestureTap" | "MSGotPointerCapture" | "MSInertiaStart" | "MSLostPointerCapture" | "MSPointerCancel" | "MSPointerDown" | "MSPointerEnter" | "MSPointerLeave" | "MSPointerMove" | "MSPointerOut" | "MSPointerOver" | "MSPointerUp" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "webkitfullscreenchange" | "webkitfullscreenerror" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "wheel">(event_name: N) => (h: (e: HTMLElementEventMap[N]) => void) => Content`

  Insert an event handler which is in the `HTMLElementEventMap`

  ```typescript
     tag('div',
       S.on('keydown')((e: KeyboardEvent) => {
         console.log('You pressed', e.char)})
     ).data.on.keydown !== undefined
     // => true
  ```
* **on_**: `(event_name: string, h: (e: Event) => void) => Content`

  Insert an event handler with any name

  ```typescript
     tag('div',
       S.on_('keydown', (e: Event) => {
         console.log('You pressed', (e as KeyboardEvent).char)})
     ).data.on.keydown !== undefined
     // => true
  ```
* **hook**: `<N extends "pre" | "init" | "create" | "insert" | "prepatch" | "update" | "postpatch" | "destroy" | "remove" | "post">(hook_name: N) => (h: Hooks[N]) => Content`

  Insert a `snabbdom` hook

  ```typescript
     tag('div',
       S.hook('insert')(
         (vn: VNode) =>
           console.log('inserted vnode', vn, 'associated with dom element', vn.elm)})
     ).data.hook.insert !== undefined
     // => true
  ```
* **hooks**: `(hooks: Hooks) => Content`

  Insert `snabbdom` hooks

  ```typescript
     tag('div',
       S.hooks({
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
* **Input**: `(store: Store<string>, onEnter?: () => void, ...content: Array<Content>) => vnode.VNode`

  
* **Checkbox**: `(store: Store<boolean>, ...content: Array<Content>) => vnode.VNode`

  
* **Button**: `(onClick: () => void, label?: string, ...content: Array<Content>) => vnode.VNode`

  
* **Textarea**: `(store: Store<string>, rows?: number, cols?: number, ...content: Array<Content>) => vnode.VNode`

  
* **Select**: `(stored: Store<string>, keys: Store<Array<string>>, option: (key: string, index: number) => vnode.VNode, ...content: Array<Content>) => vnode.VNode`

  
* **Content**: `typeof Content`

  Content to put in a `tag` 
* **h**: `{ (sel: string): vnode.VNode; (sel: string, data: vnode.VNodeData): vnode.VNode; (sel: string, text: string): vnode.VNode; (sel: string, children: Array<vnode.VNode>): vnode.VNode; (sel: string, data: vnode.VNodeData, text: string): vnode.VNode; (sel: string, data: vnode.VNodeData, children: Array<vnode.VNode>): vnode.VNode; }`

  
* **VNode**: `undefined`

  Convenience reexport of `snabbdom`'s `VNode` 
* **VNodeData**: `undefined`

  Convenience reexport of `snabbdom`'s `VNodeData` 
* **Patch**: `undefined`

  The type of a snabbdom patch, create one with snabbdom.init 
### module tags


* **factory**: `(name: string) => (...content: Array<Content>) => vnode.VNode`

  
* **div**: `(...content: Array<Content>) => vnode.VNode`

  
* **span**: `(...content: Array<Content>) => vnode.VNode`

  
* **table**: `(...content: Array<Content>) => vnode.VNode`

  
* **tbody**: `(...content: Array<Content>) => vnode.VNode`

  
* **thead**: `(...content: Array<Content>) => vnode.VNode`

  
* **tfoot**: `(...content: Array<Content>) => vnode.VNode`

  
* **tr**: `(...content: Array<Content>) => vnode.VNode`

  
* **td**: `(...content: Array<Content>) => vnode.VNode`

  
* **th**: `(...content: Array<Content>) => vnode.VNode`

  
* **h1**: `(...content: Array<Content>) => vnode.VNode`

  
* **h2**: `(...content: Array<Content>) => vnode.VNode`

  
* **h3**: `(...content: Array<Content>) => vnode.VNode`

  
* **h4**: `(...content: Array<Content>) => vnode.VNode`

  
* **h5**: `(...content: Array<Content>) => vnode.VNode`

  
* **h6**: `(...content: Array<Content>) => vnode.VNode`

  
* **li**: `(...content: Array<Content>) => vnode.VNode`

  
* **ul**: `(...content: Array<Content>) => vnode.VNode`

  
* **ol**: `(...content: Array<Content>) => vnode.VNode`

  
* **S**: `typeof Content`

  
