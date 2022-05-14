import * as t from '../lib/Library.mjs'

let array = []
let array2 = []
let array3 = []
let array4 = []
let array5 = []
let array6 = []
let array7 = []
let array8 = []
let array9 = []
let array10 = []

let emptyProxy = new Proxy(array9, {})
let emptyProxy2 = new Proxy(array10, {})

let basicProxy = new Proxy(array2, {
  get(a, b, c) {
    return a[b]
  },
  set(a, b, c, d) {
    a[b] = c
    return true
  }
})
let basicProxy2 = new Proxy(array6, {
  get(a, b, c) {
    return a[b]
  },
  set(a, b, c, d) {
    a[b] = c
    return true
  }
})

let reflectProxy = new Proxy(array7, {set(a, b, c, d) {return Reflect.set(a, b, c, d)}, get(a, b, c, d) {return Reflect.get(a, b, c, d)}})
let reflectProxy2 = new Proxy(array8, {set(a, b, c, d) {return Reflect.set(a, b, c, d)}, get(a, b, c, d) {return Reflect.get(a, b, c, d)}})

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
  for (let i = 0; i < 25_000; i++) {
    array.push(Math.random())
  }
})

t.test('Native cached fn array', () => {
  let fn = (...v) => {return array5.push(...v)}
  for (let i = 0; i < 25_000; i++) {
    fn(Math.random())
  }
})

t.test('Empty proxy', () => {
  for (let i = 0; i < 25_000; i++) {
    emptyProxy.push(Math.random())
  }
})

t.test('Cached empty proxy', () => {
  const fn = (...v) => {return emptyProxy2.push(...v)}
  for (let i = 0; i < 25_000; i++) {
    fn(Math.random())
  }
})

t.test('Basic proxy', () => {
  for (let i = 0; i < 25_000; i++) {
    basicProxy.push(Math.random())
  }
})

t.test('Cached basic proxy', () => {
  const fn = (...v) => {return basicProxy2.push(...v)}
  for (let i = 0; i < 25_000; i++) {
    fn(Math.random())
  }
})

t.test('Reflect proxy', () => {
  for (let i = 0; i < 25_000; i++) {
    reflectProxy.push(Math.random())
  }
})

t.test('Cached reflect proxy', () => {
  const fn = reflectProxy2.push.bind(reflectProxy2)
  for (let i = 0; i < 25_000; i++) {
    fn(Math.random())
  }
})

t.test('Smart proxy', () => {
  for (let i = 0; i < 25_000; i++) {
    smartProxy.push(Math.random())
  }
})

t.test('Cached smart proxy', () => {
  const fn = smartProxy2.push
  for (let i = 0; i < 25_000; i++) {
    fn(Math.random())
  }
})

t.runTests(100, 13)
// The long warmup is required to eliminate almost all outliers
// Try to run the tests without any warmup, about one third of the duration values will be significantly longer
// Total 13 iterations, so if some outliers still remain, we can eliminate them from the final set
t.writeStats('results - proxyPush.txt')
