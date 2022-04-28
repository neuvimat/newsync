import * as t from './Library.mjs'

let array = []
let array2 = []
let array3 = []
let array4 = []
let array5 = []

let proxy = new Proxy(array2, {})

let smartProxy = new Proxy(array3, {
  pushFn: (v) => {return array3.push(v)},
  get(target, prop, receiver) {
    if (prop === 'push') return this.pushFn
    return target[prop]
  }
})

let smartProxy2 = new Proxy(array4, {
  pushFn: (v) => {return array4.push(v)},
  get(target, prop, receiver) {
    if (prop === 'push') return this.pushFn
    return target[prop]
  }
})

t.test('Native array', () => {
  for (let i = 0; i < 150000; i++) {
    array.push(i)
  }
})

t.test('Native cached fn array', () => {
  // let fn = array5.push.bind(array5)
  let fn = (v) => {array5.push(v)}
  for (let i = 0; i < 150000; i++) {
    fn(i)
  }
})

t.test('Empty proxy', () => {
  for (let i = 0; i < 150000; i++) {
    proxy.push(i)
  }
})

t.test('Smart proxy', () => {
  for (let i = 0; i < 150000; i++) {
    smartProxy.push(i)
  }
})

t.test('Cached smart proxy', () => {
  const fn = smartProxy2.push
  for (let i = 0; i < 150000; i++) {
    fn(i)
  }
})

t.runTests()
