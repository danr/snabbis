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
  */
  export function classed(...classnames: string[]): Content {
    const d = {} as Record<string, boolean>
    classnames.forEach(names => names.trim().split(/\s+/g).forEach(name => d[name] = true))
    return classes(d)
  }

  /**
  Set some styles

    toHTML(tag('div', S.styles({display: 'inline-block', textTransform: 'uppercase'})))
    // => '<div style="display: inline-block; text-transform: uppercase"></div>'
  */
  export function styles(styles: VNodeStyle): Content {
    return {type: ContentType.Style, data: styles}
  }

  /**
  Set one style

    toHTML(tag('div', S.style('display', 'inline-block')))
    // => '<div style="display: inline-block"></div>'
  */
  export function style(k: string, v: string): Content {
    return styles({[k]: v})
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
  Set the key, used to identify elements for sorting and css animations

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
  export function on<N extends keyof HTMLElementEventMap>(name: N): (h: (e: HTMLElementEventMap[N]) => void) => Content {
    return h => ({type: ContentType.On, data: {[name as string]: h}})
  }

  /**
  Insert an event handler with any name

    tag('div',
      S.on_('keydown', (e: Event) => {
        console.log('You pressed', (e as KeyboardEvent).char)})
    ).data.on.keydown !== undefined
    // => true
  */
  export function on_(name: string, h: (e: Event) => void): Content {
    return ({type: ContentType.On, data: {[name]: h}})
  }

  /**
  Insert a `snabbdom` hook

    tag('div',
      S.hook({
        insert: (vn: VNode) =>
          console.log('inserted vnode', vn, 'associated with dom element', vn.elm)})
    ).data.hook.insert !== undefined
    // => true
  */
  export function hook(hook: Hooks): Content {
    return {type: ContentType.Hook, data: hook}
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
}

function has_type<R extends {type: ContentType}>(x: any): x is R {
  return typeof x == 'object' && x.type !== undefined
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

/** Convenience export of a patch function with everything included */
export const patch = snabbdom.init([
  snabbdom_style,
  snabbdom_eventlisteners,
  snabbdom_class,
  snabbdom_props,
  snabbdom_dataset,
  snabbdom_attributes,
])

/** Convenience reexport of `snabbdom`'s `init` function */
export const init = snabbdom.init
/** Convenience reexport of `snabbdom`'s `h` */
export const h = snabbdom_h.h
/** Convenience reexport of `snabbdom`'s `VNode` */
export type VNode = vnode.VNode
/** Convenience reexport of `snabbdom`'s `VNodeData` */
export type VNodeData = vnode.VNodeData

