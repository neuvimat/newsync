import * as t from '../lib/Library.mjs'

let array, array2, array3, array4, array5, proxy, smartproxy, reflectProxy, basicProxy;

t.beforeEach(() => {
  array = []
  for (let i = 0; i < 150_000; i++) {
    array.push(Math.random())
  }
  array2 = [].concat(array)
  array3 = [].concat(array)
  array4 = [].concat(array)
  array5 = [].concat(array)

  proxy = new Proxy(array2, {})
  smartproxy = new Proxy(array3, {
    get(target, prop, receiver) {
      if (prop === 'filter') {
        return (...args) => {array3.filter(...args)}
      }
      else if (prop === 'sort') {
        return (...args) => {array3.sort(...args)}
      }
      else if (prop === 'push') {
        return (...args) => {array3.push(...args)}
      }
      return target[prop]
    },
    set(a, b, c, d) {
      a[b] = c
      return true
    }
  })
  reflectProxy = new Proxy (array4, {set(a,b,c,d) {return Reflect.set(a,b,c,d)}, get(a,b,c,d) {return Reflect.get(a,b,c,d)}})
  basicProxy = new Proxy(array5, {set(a,b,c) {a[b] = c; return true}, get(a,b,c,d) {return a[b]}})
})

t.test('Native sort', () => {
  array.sort()
})

t.test('Empty proxy sort', () => {
  proxy.sort()
})

t.test('Smart proxy sort', () => {
  smartproxy.sort()
})

t.test('Reflect proxy sort', () => {
  reflectProxy.sort()
})

t.test('Basic proxy sort', () => {
  basicProxy.sort()
})



t.test('Native filter', () => {
  array.filter((a) => {return a > .5})
})

t.test('Empty proxy filter', () => {
  proxy.filter((a) => {return a > .5})
})

t.test('Smart proxy filter', () => {
  smartproxy.filter((a) => {return a > .5})
})

t.test('Reflect proxy filter', () => {
  reflectProxy.filter((a) => {return a > .5})
})

t.test('Basic proxy filter', () => {
  basicProxy.filter((a) => {return a > .5})
})


t.runTests(100, 10)
t.writeStats('results - proxyFilterSort.txt')
