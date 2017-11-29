import * as snabbdom from "snabbdom"
import * as snabbdom_h from 'snabbdom/h'
import snabbdom_style from 'snabbdom/modules/style'
import snabbdom_eventlisteners from 'snabbdom/modules/eventlisteners'
import snabbdom_class from 'snabbdom/modules/class'
import snabbdom_props from 'snabbdom/modules/props'
import snabbdom_dataset from 'snabbdom/modules/dataset'
import snabbdom_attributes from 'snabbdom/modules/attributes'
import * as vnode from "snabbdom/vnode"

import { Hooks } from 'snabbdom/hooks'
import { VNodeStyle } from 'snabbdom/modules/style'
import { On } from 'snabbdom/modules/eventlisteners'
import { Classes } from 'snabbdom/modules/class'
import { Props } from 'snabbdom/modules/props'
import { Dataset } from 'snabbdom/modules/dataset'
import { Attrs } from 'snabbdom/modules/attributes'

import { VNode } from "snabbdom/vnode"
import { Store } from "reactive-lens"

type Patcher = (vnode: VNode) => void

function connect<S>(patcher: Patcher, store: Store<S>, setup_view: (store: Store<S>) => () => VNode): () => void {
  const view = setup_view(store)
  function redraw() {
    store.transaction(() => {
      patcher(view())
    })
  }
  const off = store.on(redraw)
  redraw()
  return off
}

function setup(patch: Patch, root: HTMLElement): Patcher {
  while (root.lastChild) {
    root.removeChild(root.lastChild)
  }

  const container = document.createElement('div')
  root.appendChild(container)
  let vnode = patch(container, snabbdom.h('div'))

  return new_vnode => { vnode = patch(vnode, new_vnode) }
}

const full_patch = snabbdom.init([
  snabbdom_style,
  snabbdom_eventlisteners,
  snabbdom_class,
  snabbdom_props,
  snabbdom_dataset,
  snabbdom_attributes,
])

/** Attach a view to a reactive lens store initialized at some state.

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

Returns the reattach function. */
export function attach<S>(root: HTMLElement, init_state: S, setup_view: (store: Store<S>) => () => VNode, patch: Patch = full_patch): (setup_next_view: (store: Store<S>) => () => VNode) => void {
  const patcher = setup(patch, root)
  let store = Store.init(init_state)
  let off = connect(patcher, store, setup_view)
  return setup_next_view => {
    off()
    store = Store.init(store.get())
    off = connect(patcher, store, setup_next_view)
  }
}



/**
Make a VNode

    toHTML(tag('span#faq.right'))
    // => '<span id="faq" class="right"></span>'

    toHTML(tag('table .grid12 .tiny #mainTable'))
    // => '<table id="mainTable" class="grid12 tiny"></table>'

    toHTML(tag('.green'))
    // => '<div class="green"></div>'

You can use strings for text:

    toHTML(tag('span', 'Loreen ispun'))
    // => '<span>Loreen ispun</span>'

You can nest tags:

    toHTML(tag('span', 'Announcement: ', tag('em', 'hello world'), '!')
    // => '<span>Announcement: <em>hello world</em>!</span>'

You can pass arrays:

    const arr = ['apa', 'bepa']
    toHTML(tag('div', arr.map(e => tag('span', e))))
    // => '<div><span>apa</span><span>bepa</span></div>'

You may also pass booleans, undefined/null and those will be filtered out:

    const x = 1
    const y = 2
    const largest = [x > y && 'x largest', x < y && 'y largest']
    toHTML(tag('span', largest))
    // => '<span>y largest</span>'

    const d = {b: 3, c: 4}
    toHTML(tag('span', d['a'], d['b']))
    // => '<span>3</span>'

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
*/
export function tag(tag_name_classes_id: string, ...tag_data: TagData[]): VNode {
  let children = [] as Array<VNode>
  let key = undefined as string | number | undefined
  let props = {} as Props
  let attrs = {} as Attrs
  let classes = {} as Classes
  let style = {} as VNodeStyle
  let dataset = {} as Dataset
  let on = {} as On
  let hook = {} as Hooks
  let tag_name = 'div'
  const matches = tag_name_classes_id.match(/([.#]?[^.#\s]+)/g)
  ;
  (matches || []).map(x => {
    if (x.length > 0) {
      if (x[0] == '#') {
        tag_data.push(s.id(x.slice(1)))
      } else if (x[0] == '.') {
        tag_data.push(s.classed(x.slice(1)))
      } else {
        tag_name = x
      }
    }
  })
  function push(b: VNode | string | number | undefined | null | boolean) {
    if (typeof b == 'string') {
      children.push(vnode.vnode(undefined, undefined, undefined, b, undefined))
    } else if (typeof b == 'number') {
      push(b.toString())
    } else if (b === undefined || b === null || typeof b == 'boolean') {
      // skip
    } else {
      // VNode
      children.push(b)
    }
  }
  tag_data.map(b => {
    if (b instanceof Array) {
      b.forEach(push)
    } else if (has_type(b)) {
      switch (b.type) {
        case ContentType.Key:
          if (key !== undefined && b.data !== key) {
            console.error('key set twice (first to', key, 'now to', b.data, 'on tag', tag_name_classes_id, ')')
          }
          key = b.data
        break;
        case ContentType.Props: imprint(props, b.data)
        break;
        case ContentType.Attrs: imprint(attrs, b.data)
        break;
        case ContentType.Classes: imprint(classes, b.data)
        break;
        case ContentType.Style: imprint(style, b.data)
        break;
        case ContentType.Dataset: imprint(dataset, b.data)
        break;
        case ContentType.On: imprint(on, b.data)
        break;
        case ContentType.Hook: imprint(hook as Record<string, any>, b.data)
        break;
      }
    } else {
      push(b)
    }
  })
  const data = {props, attrs, class: classes, style, dataset, on, hook, key}
  return h(tag_name, data, children)
}

export module s {
  /**
  Set the id

    toHTML(tag('div', s.id('root')))
    // => '<div id="root"></div>'
  */
  export function id(id: string): TagData {
    return {type: ContentType.Attrs, data: {id}}
  }

  /**
  Set some classes

    toHTML(tag('div', s.classes({example: true})))
    // => '<div class="example"></div>'

    toHTML(tag('div', s.classes({nav: true, strip: true}), s.classes({'left-side': true})))
    // => '<div class="nav strip left-side"></div>'

    toHTML(tag('div', s.classes({nav: true}), s.classes({nav: false})))
    // => '<div></div>'
  */
  export function classes(classes: Classes): TagData {
    return {type: ContentType.Classes, data: classes}
  }

  /**
  Set one or more classes

    toHTML(tag('div', s.classed('navbar')))
    // => '<div class="navbar"></div>'

    toHTML(tag('div', s.classed('colourless', 'green', 'idea', 'sleeping', 'furious')))
    // => '<div class="colourless green idea sleeping furious"></div>'

  Since you cannot have class names with spaces, the string is split on whitespace:

    toHTML(tag('div', s.classed(' colourless green idea sleeping  furious ')))
    // => '<div class="colourless green idea sleeping furious"></div>'

  Whitespace-only strings vanish:

    toHTML(tag('div', s.classed('', ' ')))
    // => '<div></div>'
  */
  export function classed(...classnames: string[]): TagData {
    const d = {} as Record<string, boolean>
    (classnames.join(' ').match(/\S+/g) || []).forEach(name => d[name] = true)
    return classes(d)
  }

  /**
  Set some styles

    toHTML(tag('div', s.style({display: 'inline-block', textTransform: 'uppercase'})))
    // => '<div style="display: inline-block; text-transform: uppercase"></div>'
  */
  export function style(styles: VNodeStyle): TagData {
    return {type: ContentType.Style, data: styles}
  }

  /** Alias for style */
  export const css = style

  /**
  Set some attributes

    toHTML(tag('div', s.attrs({example: 1})))
    // => '<div example="1"></div>'

    toHTML(tag('div', s.attrs({a: 1, b: 2}), s.attrs({c: 3})))
    // => '<div a="1" b="2" c="3"></div>'

    toHTML(tag('div', s.attrs({a: 1}), s.attrs({a: 2})))
    // => '<div a="2"></div>'
  */
  export function attrs(attrs: Attrs): TagData {
    return {type: ContentType.Attrs, data: attrs}
  }

  /**
  Set the key, used to identify elements when diffing

    tag('div', s.key('example_key')).key
    // => 'example_key'
  */
  export function key(key: string | number): TagData {
    return {type: ContentType.Key, data: key}
  }

  /**
  Insert an event handler which is in the `HTMLElementEventMap`

    tag('div',
      s.on('keydown')((e: KeyboardEvent) => {
        console.log('You pressed', e.char)})
    ).data.on.keydown !== undefined
    // => true
  */
  export function on<N extends keyof HTMLElementEventMap>(event_name: N): (h: (e: HTMLElementEventMap[N]) => void) => TagData {
    return h => ({type: ContentType.On, data: {[event_name as string]: h}})
  }

  /**
  Insert an event handler with any name

    tag('div',
      s.on_('keydown', (e: Event) => {
        console.log('You pressed', (e as KeyboardEvent).char)})
    ).data.on.keydown !== undefined
    // => true
  */
  export function on_(event_name: string, h: (e: Event) => void): TagData {
    return ({type: ContentType.On, data: {[event_name]: h}})
  }

  /**
  Insert a `snabbdom` hook

    tag('div',
      s.hook('insert')(
        (vn: VNode) =>
          console.log('inserted vnode', vn, 'associated with dom element', vn.elm)})
    ).data.hook.insert !== undefined
    // => true
  */
  export function hook<N extends keyof Hooks>(hook_name: N): (h: Hooks[N]) => TagData {
    return h => ({type: ContentType.Hook, data: {[hook_name as string]: h}})
  }

  /**
  Insert `snabbdom` hooks

    tag('div',
      s.hooks({
        insert: (vn: VNode) =>
          console.log('inserted vnode', vn, 'associated with dom element', vn.elm)})
    ).data.hook.insert !== undefined
    // => true
  */
  export function hooks(hooks: Hooks): TagData {
    return {type: ContentType.Hook, data: hooks}
  }

  /**
  Set some properties (ambient data attached to dom nodes)

    tag('div', s.props({example: 1})).data.props
    // => {example: 1}

    tag('div', s.props({a: 1, b: 2}), s.props({c: 3})).data.props
    // => {a: 1, b: 2, c: 3}

    tag('div', s.props({a: 1}), s.props({a: 2})).data.props
    // => {a: 2}
  */
  export function props(props: Props): TagData {
    return {type: ContentType.Props, data: props}
  }

  /**
  Set data attribute

    tag('div', s.dataset({foo: 'bar'})).data.dataset.foo
    // => 'bar'
  */
  export function dataset(dataset: Dataset): TagData {
    return {type: ContentType.Dataset, data: dataset}
  }

  export function input(store: Store<string>, onEnter?: () => void, ...tag_data: TagData[]) {
    return tag('input',
      s.props({ value: store.get() }),
      s.on('input')((e: Event) => store.set((e.target as HTMLInputElement).value)),
      onEnter && s.on('keydown')((e: KeyboardEvent) => e.key == 'Enter' && onEnter()),
      ...tag_data)
  }

  export function checkbox(store: Store<boolean>, ...tag_data: TagData[]) {
    return tag('input',
      s.attrs({ type: 'checkbox' }),
      s.props({ value: store.get(), checked: store.get() }),
      s.on('input')((e: Event) => store.set((e.target as HTMLInputElement).value == 'true')),
      ...tag_data)
  }

  export function button(label: string, onClick: () => void, ...tag_data: TagData[]) {
    return tag('input',
      s.attrs({
        'type': 'button',
        value: label
      }),
      s.on('click')(onClick),
      ...tag_data)
  }

  export function textarea(store: Store<string>, rows=10, cols=80, ...tag_data: TagData[]) {
    return tag('textarea',
      s.props({value: store.get()}),
      s.attrs({rows, cols}),
      s.on('input')((e: Event) => store.set((e.target as HTMLTextAreaElement).value)),
      ...tag_data)
  }

  export function select(stored: Store<string>, keys: Store<string[]>, option: (key: string, index: number) => VNode, ...tag_data: TagData[]) {
    let off = undefined as undefined | (() => void)
    return tag('select',
      s.hook('insert')(
        (vn: VNode) => {
          off = stored.ondiff(current => {
            if (vn.elm) {
              const i = keys.get().indexOf(current);
              (vn.elm as HTMLSelectElement).selectedIndex = i
            }
          })
        }),
      s.hook('remove')(() => off && off()),
      keys.get().map(option),
      s.on('change')((e: Event) => {
        const i = (e.target as HTMLSelectElement).selectedIndex
        stored.set(keys.get()[i])
      }),
      ...tag_data)
  }
}

function has_type<R extends {type: ContentType}>(x: any): x is R {
  return typeof x == 'object' && x != null && 'type' in x && x.type !== undefined
}

function imprint<T>(base: Record<string, T>, more: Record<string, T>) {
  for (const k in more) {
    base[k] = more[k]
  }
}

export const enum ContentType {
  Key,
  Props,
  Attrs,
  Classes,
  Style,
  Dataset,
  On,
  Hook,
}

/** Content to put in a `tag` */
export type TagData
  = Array<VNode | undefined | null | boolean | number | string>
  | VNode
  | null
  | undefined
  | boolean
  | number
  | string
  | { type: ContentType.Key, data: string | number}
  | { type: ContentType.Props, data: Props }
  | { type: ContentType.Attrs, data: Attrs }
  | { type: ContentType.Classes, data: Classes }
  | { type: ContentType.Style, data: VNodeStyle }
  | { type: ContentType.Dataset, data: Dataset }
  | { type: ContentType.On, data: On }
  | { type: ContentType.Hook, data: Hooks }

/** Convenience reexport of `snabbdom`'s `h` */
export const h = snabbdom_h.h
/** Convenience reexport of `snabbdom`'s `VNode` */
export type VNode = vnode.VNode
/** Convenience reexport of `snabbdom`'s `VNodeData` */
export type VNodeData = vnode.VNodeData
/** The type of a snabbdom patch, create one with snabbdom.init */
export type Patch = (oldVnode: VNode | Element, vnode: VNode) => VNode

/** Common tags

Example usage:

```typescript
import { tags } from "snabbis"
const {div, span, h1} = tags
```

*/
export module tags {
  export const factory = (name: string) => (...tag_data: TagData[]) => tag(name, ...tag_data)

  export const div = factory('div')
  export const span = factory('span')
  export const p = factory('p')
  export const pre = factory('pre')

  export const em = factory('em')
  export const strong = factory('strong')

  export const b = factory('b')
  export const i = factory('i')
  export const u = factory('u')
  export const strike = factory('strike')
  export const small = factory('small')

  export const table = factory('table')
  export const tbody = factory('tbody')
  export const thead = factory('thead')
  export const tfoot = factory('tfoot')
  export const tr = factory('tr')
  export const td = factory('td')
  export const th = factory('th')

  export const h1 = factory('h1')
  export const h2 = factory('h2')
  export const h3 = factory('h3')
  export const h4 = factory('h4')
  export const h5 = factory('h5')
  export const h6 = factory('h6')

  export const li = factory('li')
  export const ul = factory('ul')
  export const ol = factory('ol')
}
