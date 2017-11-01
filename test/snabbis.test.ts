import * as test from "tape"
import { tag, Content as S } from '../src/snabbis'
const toHTML = require('snabbdom-to-html')
import { VNode } from '../src/snabbis'
test("tag 1", assert => {
  
  assert.deepEqual(
     toHTML(tag('span#faq.right')) ,
     '<span id="faq" class="right"></span>' ,
    "tag")
  assert.end()
})
test("tag 2", assert => {
  
  assert.deepEqual(
     toHTML(tag('table .grid12 .tiny #mainTable')) ,
     '<table id="mainTable" class="grid12 tiny"></table>' ,
    "tag")
  assert.end()
})
test("tag 3", assert => {
  
  assert.deepEqual(
     toHTML(   tag('div',     'Announcement: ',     tag('span', 'hello'), ' ',     tag('span', 'world'))) ,
     '<div>Announcement: <span>hello</span> <span>world</span></div>' ,
    "tag")
  assert.end()
})
test("tag 4", assert => {
  const arr = ['apa', 'bepa']
  
  assert.deepEqual(
     toHTML(tag('div', arr.map(e => tag('span', e)))) ,
     '<div><span>apa</span><span>bepa</span></div>' ,
    "tag")
  assert.end()
})
test("tag 5", assert => {
  const arr = ['apa', 'bepa']
  
  assert.deepEqual(
     toHTML(   tag('div',      arr[0] == 'apa' || 'first',      arr[1] == 'apa' || 'second',      arr[2])) ,
     '<div>second</div>' ,
    "tag")
  assert.end()
})
test("id 6", assert => {
  
  assert.deepEqual(
     toHTML(tag('div', S.id('root'))) ,
     '<div id="root"></div>' ,
    "id")
  assert.end()
})
test("classes 7", assert => {
  
  assert.deepEqual(
     toHTML(tag('div', S.classes({example: true}))) ,
     '<div class="example"></div>' ,
    "classes")
  assert.end()
})
test("classes 8", assert => {
  
  assert.deepEqual(
     toHTML(tag('div', S.classes({nav: true, strip: true}), S.classes({'left-side': true}))) ,
     '<div class="nav strip left-side"></div>' ,
    "classes")
  assert.end()
})
test("classes 9", assert => {
  
  assert.deepEqual(
     toHTML(tag('div', S.classes({nav: true}), S.classes({nav: false}))) ,
     '<div></div>' ,
    "classes")
  assert.end()
})
test("classed 10", assert => {
  
  assert.deepEqual(
     toHTML(tag('div', S.classed('navbar'))) ,
     '<div class="navbar"></div>' ,
    "classed")
  assert.end()
})
test("styles 11", assert => {
  
  assert.deepEqual(
     toHTML(tag('div', S.styles({display: 'inline-block', textTransform: 'uppercase'}))) ,
     '<div style="display: inline-block; text-transform: uppercase"></div>' ,
    "styles")
  assert.end()
})
test("style 12", assert => {
  
  assert.deepEqual(
     toHTML(tag('div', S.style('display', 'inline-block'))) ,
     '<div style="display: inline-block"></div>' ,
    "style")
  assert.end()
})
test("attrs 13", assert => {
  
  assert.deepEqual(
     toHTML(tag('div', S.attrs({example: 1}))) ,
     '<div example="1"></div>' ,
    "attrs")
  assert.end()
})
test("attrs 14", assert => {
  
  assert.deepEqual(
     toHTML(tag('div', S.attrs({a: 1, b: 2}), S.attrs({c: 3}))) ,
     '<div a="1" b="2" c="3"></div>' ,
    "attrs")
  assert.end()
})
test("attrs 15", assert => {
  
  assert.deepEqual(
     toHTML(tag('div', S.attrs({a: 1}), S.attrs({a: 2}))) ,
     '<div a="2"></div>' ,
    "attrs")
  assert.end()
})
test("key 16", assert => {
  
  assert.deepEqual(
     tag('div', S.key('example_key')).key ,
     'example_key' ,
    "key")
  assert.end()
})
test("on 17", assert => {
  
  assert.deepEqual(
     tag('div',   S.on('keydown')((e: KeyboardEvent) => {     console.log('You pressed', e.char)}) ).data.on.keydown !== undefined ,
     true ,
    "on")
  assert.end()
})
test("on_ 18", assert => {
  
  assert.deepEqual(
     tag('div',   S.on_('keydown', (e: Event) => {     console.log('You pressed', (e as KeyboardEvent).char)}) ).data.on.keydown !== undefined ,
     true ,
    "on_")
  assert.end()
})
test("hook 19", assert => {
  
  assert.deepEqual(
     tag('div',   S.hook({     insert: (vn: VNode) =>       console.log('inserted vnode', vn, 'associated with dom element', vn.elm)}) ).data.hook.insert !== undefined ,
     true ,
    "hook")
  assert.end()
})
test("props 20", assert => {
  
  assert.deepEqual(
     tag('div', S.props({example: 1})).data.props ,
     {example: 1} ,
    "props")
  assert.end()
})
test("props 21", assert => {
  
  assert.deepEqual(
     tag('div', S.props({a: 1, b: 2}), S.props({c: 3})).data.props ,
     {a: 1, b: 2, c: 3} ,
    "props")
  assert.end()
})
test("props 22", assert => {
  
  assert.deepEqual(
     tag('div', S.props({a: 1}), S.props({a: 2})).data.props ,
     {a: 2} ,
    "props")
  assert.end()
})
test("dataset 23", assert => {
  
  assert.deepEqual(
     tag('div', S.dataset({foo: 'bar'})).data.dataset.foo ,
     'bar' ,
    "dataset")
  assert.end()
})
