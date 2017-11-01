# snabbis

> An opinionated domain specific language for snabbdom.

## Documentation

### tag

```typescript
function tag(tag_name_and_classes_and_id: string, ...content: Content[]): VNode
```

Make a VNode

Import `snabbis` like so:

```typescript
import { tag, Content as S } from 'snabbis'
```

Feel free to rename `tag` or `S` to whatever you feel beautiful.

This documentation uses `toHTML` from the `snabbdom-to-html` package:

```typescript
const toHTML = require('snabbdom-to-html')
```

They also use `VNode` from `snabbdom` which is reexported by `snabbis` for convenience:

```typescript
import { VNode } from 'snabbis'
```

It is easy to set the tag name and the classes

```typescript
> toHTML(tag('span#faq.right'))
'<span id="faq" class="right"></span>'
```

```typescript
> toHTML(tag('table .grid12 .tiny #mainTable'))
'<table id="mainTable" class="grid12 tiny"></table>'
```

You can nest tags and use strings for text:
```typescript
> toHTML(
>   tag('div',
>     'Announcement: ',
>     tag('span', 'hello'), ' ',
>     tag('span', 'world')))
'<div>Announcement: <span>hello</span> <span>world</span></div>'
```

It's ok to pass arrays:
```typescript
const arr = ['apa', 'bepa']
```

```
> toHTML(tag('div', arr.map(e => tag('span', e))))
'<div><span>apa</span><span>bepa</span></div>'
```

You may also pass booleans, undefined and null and those will be filtered out:
```typescript
> toHTML(
>   tag('div',
>      arr[0] == 'apa' || 'first',
>      arr[1] == 'apa' || 'second',
>      arr[2]))
'<div>second</div>'
```

The other kinds of content to the tag function is documented by their respective function.





### module Content



### Content.id

```typescript
function id(id: string): Content
```

Set the id

```typescript
> toHTML(tag('div', S.id('root')))
'<div id="root"></div>'
```





### Content.key

```typescript
function key(key: string | number): Content
```

Set the key

```typescript
> tag('div', S.key('example_key')).key
'example_key'
```





### Content.props

```typescript
function props(props: Props): Content
```

Set some properties (ambient data attached to dom nodes)

```typescript
> tag('div', S.props({example: 1})).data.props
{example: 1}
```

```typescript
> tag('div', S.props({a: 1, b: 2}), S.props({c: 3})).data.props
{a: 1, b: 2, c: 3}
```

```typescript
> tag('div', S.props({a: 1}), S.props({a: 2})).data.props
{a: 2}
```





### Content.attrs

```typescript
function attrs(attrs: Attrs): Content
```

Set some attributes

```typescript
> toHTML(tag('div', S.attrs({example: 1})))
'<div example="1"></div>'
```

```typescript
> toHTML(tag('div', S.attrs({a: 1, b: 2}), S.attrs({c: 3})))
'<div a="1" b="2" c="3"></div>'
```

```typescript
> toHTML(tag('div', S.attrs({a: 1}), S.attrs({a: 2})))
'<div a="2"></div>'
```





### Content.classes

```typescript
function classes(classes: Classes): Content
```

Set some classes

```typescript
> toHTML(tag('div', S.classes({example: true})))
'<div class="example"></div>'
```

```typescript
> toHTML(tag('div', S.classes({nav: true, strip: true}), S.classes({'left-side': true})))
'<div class="nav strip left-side"></div>'
```

```typescript
> toHTML(tag('div', S.classes({nav: true}), S.classes({nav: false})))
'<div></div>'
```





### Content.classed

```typescript
function classed(c: string): Content
```

Set one class

```typescript
> toHTML(tag('div', S.classed('navbar')))
'<div class="navbar"></div>'
```





### Content.styles

```typescript
function styles(styles: VNodeStyle): Content
```

Set some styles

```typescript
> toHTML(tag('div', S.styles({display: 'inline-block', textTransform: 'uppercase'})))
'<div style="display: inline-block; text-transform: uppercase"></div>'
```





### Content.style

```typescript
function style(k: string, v: string): Content
```

Set one style

```typescript
> toHTML(tag('div', S.style('display', 'inline-block')))
'<div style="display: inline-block"></div>'
```





### Content.dataset

```typescript
function dataset(dataset: Dataset): Content
```

Set data attribute

```typescript
> tag('div', S.dataset({foo: 'bar'})).data.dataset.foo
'bar'
```





### Content.hook

```typescript
function hook(hook: Hooks): Content
```

Insert a hook

```typescript
> tag('div',
>   S.hook({
>     insert: (vn: VNode) =>
>       console.log('inserted vnode', vn, 'associated with dom element', vn.elm)})
> ).data.hook.insert !== undefined
true
```





### Content.on

```typescript
function on<N extends keyof HTMLElementEventMap>(name: N):
  (h: (e: HTMLElementEventMap[N]) => void) => Content
```

Insert an event handler which is in the `HTMLElementEventMap`

```typescript
> tag('div',
>   S.on('keydown')((e: KeyboardEvent) => {
>     console.log('You pressed', e.char)})
> ).data.on.keydown !== undefined
true
```





### Content.on_

```typescript
function on_(name: string, h: (e: Event) => void): Content
```

Insert an event handler with any name

```typescript
> tag('div',
>   S.on_('keydown', (e: Event) => {
>     console.log('You pressed', (e as KeyboardEvent).char)})
> ).data.on.keydown !== undefined
true
```







### patch

```typescript
const patch: (oldVnode: Element | vnode.VNode, vnode: vnode.VNode) => vnode.VNode
```

Convenience export of a patch function with everything included





### init

```typescript
const init: typeof snabbdom.init
```

Convenience reexport of `snabbdom`'s `init` function





### h

```typescript
const h: typeof snabbdom_h.h
```

Convenience reexport of `snabbdom`'s `h`





### type VNode

```typescript
type VNode = vnode.VNode
```

Convenience reexport of `snabbdom`'s `VNode`





### type VNodeData

```typescript
type VNodeData = vnode.VNodeData
```

Convenience reexport of `snabbdom`'s `VNodeData`







