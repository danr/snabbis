import { tag, s, TagData } from "snabbis"
import { Store, Lens, Omit } from "reactive-lens"
import { VNode } from "snabbdom/vnode"
import * as Model from "./Model"
import { State, Todo, Visibility } from "./Model"

export {Model}

// actually not a checkbox
const Checkbox =
  (value: boolean, update: (new_value: boolean) => void, ...ss: TagData[]) =>
  tag('span',
    s.classes({checked: value}),
    s.on('click')((_: MouseEvent) => update(!value)),
    s.on('input')((_: Event) => update(!value)),
    s.style({cursor: 'pointer'}),
    ...ss)

export const App = (store: Store<State>) => {
  const global = window as any
  global.store = store
  global.reset = () => store.set(Model.init)
  store.storage_connect('todomvc')
  store.at('visibility').location_connect(Model.to_hash, Model.from_hash)
  store.on(x => console.log(JSON.stringify(x, undefined, 2)))
  return () => View(store)
}

export const View = (store: Store<State>): VNode => {
  const {todos, visibility} = store.get()
  const todos_store = store.at('todos')

  const Header =
    tag('header .header',
      tag('h1', 'todos'),
      s.input(
        store.at('new_input'),
        () => store.modify(Model.new_todo),
        s.attrs({
          placeholder: 'What needs to be done?',
          autofocus: true
        }),
        s.classed('new-todo')))

  const TodoView =
    (todo_store: Store<Todo>, {completed, text, editing, id}: Todo, rm: () => void) =>
      tag('li .todo',
        s.key(id),
        s.classes({ completed, editing }),
        tag('div',
          s.classes({ view: !editing }),
          Checkbox(
            completed,
            (v) => todo_store.at('completed').set(v),
            s.classed('toggle'),
            s.style({height: '40px'})),
          editing || tag('label',
            text,
            s.style({cursor: 'pointer'}),
            s.on('dblclick')((e: MouseEvent) => {
              todo_store.at('editing').set(true)
            }),
          ),
          editing &&
            s.input(
              todo_store.at('text'),
              () => todo_store.at('editing').set(false),
              s.classed('edit'),
              s.on('blur')(() => todo_store.at('editing').set(false))),
          tag('button .destroy', s.on('click')(rm))),
        )

  const Main =
    todos.length > 0 &&
    tag('section .main',
      Checkbox(
        Model.all_completed(todos),
        (b: boolean) => todos_store.modify(Model.set_all(!b)),
        s.classed('toggle-all'),
        s.id('toggle-all')),
      tag('ul .todo-list',
        Store.each(todos_store).map(
          (ref, i) => {
            const todo = ref.get()
            const rm = () => todos_store.modify(Model.remove_todo(i))
            if (Model.todo_visible(todo, visibility)) {
              return TodoView(ref, todo, rm)
            }
          })))

  const Footer =
    tag('footer .footer',
      tag('span .todo-count', todos.length.toString()),
      tag('ul .filters',
        Model.visibilites.map((opt: Visibility) =>
          tag('li',
            tag('a',
              s.classes({selected: visibility == opt}),
              s.attrs({href: '#/' + opt}),
              opt)))))

  // todo: clear completed

  return tag('section .todoapp #todoapp', Header, Main, Footer)
}

