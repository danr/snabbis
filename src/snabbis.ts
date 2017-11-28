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

*/
export function tag(tag_name_and_classes_and_id: string, ...content: Content[]): VNode {
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
  const matches = tag_name_and_classes_and_id.match(/([.#]?[^.#\s]+)/g)
  ;
  (matches || []).map(x => {
    if (x.length > 0) {
      if (x[0] == '#') {
        content.push(Content.id(x.slice(1)))
      } else if (x[0] == '.') {
        content.push(Content.classed(x.slice(1)))
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
  content.map(b => {
    if (b instanceof Array) {
      b.forEach(push)
    } else if (has_type(b)) {
      switch (b.type) {
        case ContentType.Key:
          if (key !== undefined && b.data !== key) {
            console.error('key set twice (first to', key, 'now to', b.data, 'on tag', tag_name_and_classes_and_id, ')')
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

export module Content {
  /**
  Set the id

    toHTML(tag('div', S.id('root')))
    // => '<div id="root"></div>'
  */
  export function id(id: string): Content {
    return {type: ContentType.Attrs, data: {id}}
  }

  /**
  Set some classes

    toHTML(tag('div', S.classes({example: true})))
    // => '<div class="example"></div>'

    toHTML(tag('div', S.classes({nav: true, strip: true}), S.classes({'left-side': true})))
    // => '<div class="nav strip left-side"></div>'

    toHTML(tag('div', S.classes({nav: true}), S.classes({nav: false})))
    // => '<div></div>'
  */
  export function classes(classes: Classes): Content {
    return {type: ContentType.Classes, data: classes}
  }

  /**
  Set one or more classes

    toHTML(tag('div', S.classed('navbar')))
    // => '<div class="navbar"></div>'

    toHTML(tag('div', S.classed('colourless', 'green', 'idea', 'sleeping', 'furious')))
    // => '<div class="colourless green idea sleeping furious"></div>'

  Since you cannot have class names with spaces, the string is split on whitespace:

    toHTML(tag('div', S.classed(' colourless green idea sleeping  furious ')))
    // => '<div class="colourless green idea sleeping furious"></div>'

  Whitespace-only strings vanish:

    toHTML(tag('div', S.classed('', ' ')))
    // => '<div></div>'
  */
  export function classed(...classnames: string[]): Content {
    const d = {} as Record<string, boolean>
    const names = ([] as string[]).concat(...
      classnames.map(names => names.trim().split(/\s+/g)))
    names.filter(name => name && name.trim() != '').forEach(name => d[name] = true)
    return classes(d)
  }

  /**
  Set some styles

    toHTML(tag('div', S.style({display: 'inline-block', textTransform: 'uppercase'})))
    // => '<div style="display: inline-block; text-transform: uppercase"></div>'
  */
  export function style(styles: VNodeStyle): Content {
    return {type: ContentType.Style, data: styles}
  }

  /**
  Set some attributes

    toHTML(tag('div', S.attrs({example: 1})))
    // => '<div example="1"></div>'

    toHTML(tag('div', S.attrs({a: 1, b: 2}), S.attrs({c: 3})))
    // => '<div a="1" b="2" c="3"></div>'

    toHTML(tag('div', S.attrs({a: 1}), S.attrs({a: 2})))
    // => '<div a="2"></div>'
  */
  export function attrs(attrs: Attrs): Content {
    return {type: ContentType.Attrs, data: attrs}
  }

  /**
  Set the key, used to identify elements when diffing

    tag('div', S.key('example_key')).key
    // => 'example_key'
  */
  export function key(key: string | number): Content {
    return {type: ContentType.Key, data: key}
  }

  /**
  Insert an event handler which is in the `HTMLElementEventMap`

    tag('div',
      S.on('keydown')((e: KeyboardEvent) => {
        console.log('You pressed', e.char)})
    ).data.on.keydown !== undefined
    // => true
  */
  export function on<N extends keyof HTMLElementEventMap>(event_name: N): (h: (e: HTMLElementEventMap[N]) => void) => Content {
    return h => ({type: ContentType.On, data: {[event_name as string]: h}})
  }

  /**
  Insert an event handler with any name

    tag('div',
      S.on_('keydown', (e: Event) => {
        console.log('You pressed', (e as KeyboardEvent).char)})
    ).data.on.keydown !== undefined
    // => true
  */
  export function on_(event_name: string, h: (e: Event) => void): Content {
    return ({type: ContentType.On, data: {[event_name]: h}})
  }

  /**
  Insert a `snabbdom` hook

    tag('div',
      S.hook('insert')(
        (vn: VNode) =>
          console.log('inserted vnode', vn, 'associated with dom element', vn.elm)})
    ).data.hook.insert !== undefined
    // => true
  */
  export function hook<N extends keyof Hooks>(hook_name: N): (h: Hooks[N]) => Content {
    return h => ({type: ContentType.Hook, data: {[hook_name as string]: h}})
  }

  /**
  Insert `snabbdom` hooks

    tag('div',
      S.hooks({
        insert: (vn: VNode) =>
          console.log('inserted vnode', vn, 'associated with dom element', vn.elm)})
    ).data.hook.insert !== undefined
    // => true
  */
  export function hooks(hooks: Hooks): Content {
    return {type: ContentType.Hook, data: hooks}
  }

  /**
  Set some properties (ambient data attached to dom nodes)

    tag('div', S.props({example: 1})).data.props
    // => {example: 1}

    tag('div', S.props({a: 1, b: 2}), S.props({c: 3})).data.props
    // => {a: 1, b: 2, c: 3}

    tag('div', S.props({a: 1}), S.props({a: 2})).data.props
    // => {a: 2}
  */
  export function props(props: Props): Content {
    return {type: ContentType.Props, data: props}
  }

  /**
  Set data attribute

    tag('div', S.dataset({foo: 'bar'})).data.dataset.foo
    // => 'bar'
  */
  export function dataset(dataset: Dataset): Content {
    return {type: ContentType.Dataset, data: dataset}
  }

  export function Input(store: Store<string>, onEnter?: () => void, ...content: Content[]) {
    return tag('input',
      S.props({ value: store.get() }),
      S.on('input')((e: Event) => store.set((e.target as HTMLInputElement).value)),
      onEnter && S.on('keydown')((e: KeyboardEvent) => e.key == 'Enter' && onEnter()),
      ...content)
  }

  export function Checkbox(store: Store<boolean>, ...content: Content[]) {
    return tag('input',
      S.attrs({ type: 'checkbox' }),
      S.props({ value: store.get(), checked: store.get() }),
      S.on('input')((e: Event) => store.set((e.target as HTMLInputElement).value == 'true')),
      ...content)
  }

  export function Button(onClick: () => void, label: string = '', ...content: Content[]) {
    return tag('input',
      S.attrs({
        'type': 'button',
        value: label
      }),
      S.on('click')(onClick),
      ...content)
  }

  export function Textarea(store: Store<string>, rows=10, cols=80, ...content: Content[]) {
    return tag('textarea',
      S.props({value: store.get()}),
      S.attrs({rows, cols}),
      S.on('input')((e: Event) => store.set((e.target as HTMLTextAreaElement).value)),
      ...content)
  }

  export function Select(stored: Store<string>, keys: Store<string[]>, option: (key: string, index: number) => VNode, ...content: Content[]) {
    let off = undefined as undefined | (() => void)
    return tag('select',
      S.hook('insert')(
        (vn: VNode) => {
          off = stored.ondiff(current => {
            if (vn.elm) {
              const i = keys.get().indexOf(current);
              (vn.elm as HTMLSelectElement).selectedIndex = i
            }
          })
        }),
      S.hook('remove')(() => off && off()),
      keys.get().map(option),
      S.on('change')((e: Event) => {
        const i = (e.target as HTMLSelectElement).selectedIndex
        stored.set(keys.get()[i])
      }),
      ...content)
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
export type Content
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

export module tags {
  export const factory = (name: string) => (...content: Content[]) => tag(name, ...content)
  export const div = factory('div')
  export const span = factory('span')
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

export const S = Content

