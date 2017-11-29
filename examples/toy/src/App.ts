import { tag, s, TagData } from "snabbis"
import { VNode } from "snabbdom/vnode"
import { Store, Lens, Undo } from "reactive-lens"

export interface State {
  slide: number,
  slides: Slides
}

export interface Slides {
  title: string,
  input: {
    a: string,
    b: string,
  },
  table: Undo<Table>,
  order: string,
}

export interface Table {
  headers: string[],
  table: Record<string, string>[]
}

export const init: State = {
  slide: 0,
  slides: {
    title: "reactive-lens",
    input: {
      a: "",
      b: ""
    },
    table: Undo.advance(Undo.init({
      headers: ["word", "pos"],
      table: [
        {word: "Gunilla", pos:"PM", msd:"PM.NOM", lemma:"|Gunilla|", lex:"|Gunilla..pm.1|", saldo:"|Gunilla..1|", prefix:"|", suffix:"|", ref:"1", dephead:"2", deprel:"SS"},
        {word: "går", pos:"VB", msd:"VB.PRS.AKT", lemma:"|gå|", lex:"|gå..vb.1|", saldo:"|gå..1|gå..10|gå..11|gå..2|gå..3|gå..4|gå..5|gå..6|gå..7|gå..8|gå..9|", prefix:"|", suffix:"|", ref:"2", deprel:"ROOT"},
        {word: "till", pos:"PP", msd:"PP", lemma:"|till|", lex:"|till..pp.1|", saldo:"|till..1|", prefix:"|", suffix:"|", ref:"3", dephead:"2", deprel:"OA"},
        {word: "kvarterskrogen", pos:"NN", msd:"NN.UTR.SIN.DEF.NOM", lemma:"|", lex:"|", saldo:"|", prefix:"|kvarter..nn.1|", suffix:"|krog..nn.1|", ref:"4", dephead:"3", deprel:"PA"},
        {word: ".", pos:"MAD", msd:"MAD", lemma:"|", lex:"|", saldo:"|", prefix:"|", suffix:"|", ref:"5", dephead:"2", deprel:"IP"},
      ]
    })),
    order: "1, 5, 2, 4, 3",
  },
}

const slides = 7

const json = (x: any) => JSON.stringify(x, undefined, 2)

function Views(slide: number, store: Store<Slides>): VNode {
  const input = store.at('input')
  const table = store.at('table').at('now')
  const history = store.at('table')
  switch (slide) {
    case 0: return tag('span', store.at('title').get())
    case 1: return tag('div',
      tag('div', 'textrutan: ', InputField(input.at('a'))),
      tag('div', 'annat: ', InputField(input.at('b')))
    )
    case 2: return tag('div', tag('div', Views(slide - 1, store)), Textarea(input))
    case 3: return Tabulate(history)
    case 4: return tag('div', tag('div', Views(slide - 1, store)), Textarea(table))
    case 5: return (
      tag('div',
        tag('div', Views(slide - 2, store)),
        tag('div',
          Button(() => history.modify(Undo.undo), 'undo'),
          Button(() => history.modify(Undo.redo), 'redo')
        ),
        Textarea(history)))
    case 6:
      const order = store.at('order')
      const xs = (order.get().match(/\d+/g) || []).map(d => parseInt(d))
      return (
        tag('div',
          s.input(store.at('order'), undefined),
          tag('div',
            s.style({display: 'flex'}),
            xs.map((x, i) =>
              tag('div',
                s.style({order: x.toString()}),
                (i + 1).toString(),
                s.style({
                  width: '50px',
                  height: '40px',
                  margin: '10px',
                  padding: '10px',
                  paddingTop: '20px',
                  background: '#ab2399',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '50px',
                  transitionProperty: 'order',
                  transitionDuration: '1s',
                  transitionTimingFunction: 'linear',
                }))))))
    default: return tag('div', 'no more slides!')
  }
}

function Tabulate(history: Store<Undo<Table>>) {
  const store = history.at('now')
  const {headers, table} = store.get()
  const advance = () => {
    const {prev, now} = history.get()
    if (prev == null || (prev.top != now)) {
      history.modify(Undo.advance)
    }
  }
  const blur_advance = s.on('blur')(advance)
  return tag('table',
    tag('thead',
      tag('tr',
        Button(() => store.transaction(() => {
            advance()
            Store.arr(store.at('headers'), 'unshift')(headers.length.toString())
          }),
          '+'),
        headers.map(
          (h, i) =>
            tag('th',
              InputField(
                store.at('headers').via(Lens.index(i)),
                blur_advance),
              Button(() => store.transaction(() => {
                  advance()
                  Store.arr(store.at('headers'), 'splice')(i, 1)
                }),
                '-'),
              Button(() => store.transaction(() => {
                  advance()
                  Store.arr(store.at('headers'), 'splice')(i+1, 0, headers.length.toString())
                }),
                '+'),
            )))),
    tag('tbody',
      table.map(
        (row, i) =>
          tag('tr',
            tag('td', i),
            headers.map(
              (h, j) =>
                tag('td',
                  InputField(
                    store
                      .at('table')
                      .via(Lens.index(i))
                      .via(Lens.key(h))
                      .via(Lens.def('')),
                    blur_advance))))),
      tag('tr',
        tag('td', s.attrs({colspan: headers.length + 1}),
          Button(() => store.transaction(() => {
              advance()
              Store.arr(store.at('table'), 'push')({})
            }),
            '+')))))
}

function Button(cb: () => void, label: string = '', ...bs: TagData[]) {
  return tag('input',
    s.attrs({
      'type': 'button',
      value: label
    }),
    s.on('click')(cb),
    ...bs)
 }

const CatchSubmit = (cb: () => void, ...bs: TagData[]) =>
  tag('form',
    s.on('submit')((e: Event) => {
        cb()
        e.preventDefault()
      }),
    ...bs)

const InputField = (store: Store<string>, ...bs: TagData[]) =>
  tag('input',
    s.props({ value: store.get() }),
    s.on('input')((e: Event) =>
      store.set((e.target as HTMLInputElement).value)),
    ...bs)

const CheckBox = (store: Store<boolean>, ...bs: TagData[]) =>
  tag('input',
    s.attrs({ type: 'checkbox' }),
    s.props({ value: store.get() }),
    s.on('input')((e: Event) => store.set((e.target as HTMLInputElement).value == 'true')),
    ...bs)

const Textarea = (store: Store<any>, ...bs: TagData[]) =>
  tag('textarea',
    s.props({value: json(store.get())}),
    s.attrs({rows: 10, cols: 60}),
    s.on('input')((e: Event) => {
      try {
        const obj = JSON.parse((e.target as any).value)
        store.set(obj)
      } catch (e) {
        // pass
      }
    })
  )

export const App = (root: Store<State>) => {
  const global = window as any
  global.reset = () => root.set(init)
  global.Store = Store
  global.Lens = Lens
  global.Undo = Undo
  const store = root.at('slides')
  global.root = root
  global.slide = root.at('slide')
  global.store = store
  global.title_store = store.at('title')
  global.ab_store = store.at('input')
  global.table_store = store.at('table').at('now')
  global.history_store = store.at('table')
  store.storage_connect('toy')
  root.at('slide').location_connect(to_hash, from_hash)
  // store.on(x => console.log(JSON.stringify(x, undefined, 2))),
  return () => tag(
    'div .Slide' + root.at('slide').get(),
    Views(root.at('slide').get(), store))
}

function from_hash(hash: string): number | undefined {
  const n = parseInt(hash.slice(1))
  console.log(hash, n, slides)
  if (n >= 0 && n < slides) {
    return n
  } else {
    return undefined
  }
}

function to_hash(slide: number): string {
  return '#' + slide.toString()
}

