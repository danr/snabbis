import { tag, Content as S } from "snabbis"
import { Store, Lens, Omit } from "reactive-lens"
import { VNode } from "snabbdom/vnode"
import * as Model from "./Model"
import { State, Todo, Visibility } from "./Model"

export {Model}

// actually not a checkbox
const Checkbox =
  (value: boolean, update: (new_value: boolean) => void, ...ss: S[]) =>
  tag('span',
    S.classes({checked: value}),
    S.on('click')((_: MouseEvent) => update(!value)),
    S.on('input')((_: Event) => update(!value)),
    S.style({cursor: 'pointer'}),
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
      S.Input(
        store.at('new_input'),
        () => store.modify(Model.new_todo),
        S.attrs({
          placeholder: 'What needs to be done?',
          autofocus: true
        }),
        S.classed('new-todo')))

  const TodoView =
    (todo_store: Store<Todo>, {completed, text, editing, id}: Todo, rm: () => void) =>
      tag('li .todo',
        S.key(id),
        S.classes({ completed, editing }),
        tag('div',
          S.classes({ view: !editing }),
          Checkbox(
            completed,
            (v) => todo_store.at('completed').set(v),
            S.classed('toggle'),
            S.style({height: '40px'})),
          editing || tag('label',
            text,
            S.style({cursor: 'pointer'}),
            S.on('dblclick')((e: MouseEvent) => {
              todo_store.at('editing').set(true)
            }),
          ),
          editing &&
            S.Input(
              todo_store.at('text'),
              () => todo_store.at('editing').set(false),
              S.classed('edit'),
              S.on('blur')(() => todo_store.at('editing').set(false))),
          tag('button .destroy', S.on('click')(rm))),
        )

  const Main =
    todos.length > 0 &&
    tag('section .main',
      Checkbox(
        Model.all_completed(todos),
        (b: boolean) => todos_store.modify(Model.set_all(!b)),
        S.classed('toggle-all'),
        S.id('toggle-all')),
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
              S.classes({selected: visibility == opt}),
              S.attrs({href: '#/' + opt}),
              opt)))))

  // todo: clear completed

  return tag('section .todoapp #todoapp', Header, Main, Footer)
}

