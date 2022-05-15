import * as t from '../lib/Library.mjs'

let native, reflectProxy, basicProxy, emptyProxy, toBeProxied1, toBeProxied2, toBeProxied3;

t.before(() => {
  native = {number: 0}
  toBeProxied1 = {number: 0}
  toBeProxied2 = {number: 0}
  toBeProxied3 = {number: 0}
  reflectProxy = new Proxy(toBeProxied1, {get(a,b,c) {return Reflect.get(a,b,c)}, set(a,b,c,d) {return Reflect.set(a,b,c,d)}})
  basicProxy = new Proxy(toBeProxied2, {
      get(a, b, c) {
        return a[b]
      },
      set(a, b, c, d) {
        a[b] = c
        return true
      }
    })
  emptyProxy = new Proxy(toBeProxied3, {})
})

t.test('Native += add', () => {
  for (let i = 0; i < 100_000; i++) {
    native.number += Math.random()
  }
})

t.test('Reflect proxy += add', () => {
  for (let i = 0; i < 100_000; i++) {
    reflectProxy.number += Math.random()
  }
})

t.test('Basic proxy += add', () => {
  for (let i = 0; i < 100_000; i++) {
    basicProxy.number += Math.random()
  }
})

t.test('Empty proxy += add', () => {
  for (let i = 0; i < 100_000; i++) {
    emptyProxy.number += Math.random()
  }
})

t.test('Native add', () => {
  for (let i = 0; i < 100_000; i++) {
    native.number = native.number + Math.random()
  }
})

t.test('Reflect proxy add', () => {
  for (let i = 0; i < 100_000; i++) {
    reflectProxy.number = reflectProxy.number + Math.random()
  }
})

t.test('Basic proxy add', () => {
  for (let i = 0; i < 100_000; i++) {
    basicProxy.number = basicProxy.number + Math.random()
  }
})

t.test('Empty proxy add', () => {
  for (let i = 0; i < 100_000; i++) {
    emptyProxy.number = emptyProxy.number + Math.random()
  }
})

t.test('Native get', () => {
  for (let i = 0; i < 100_000; i++) {
    native.number
  }
})

t.test('Reflect proxy get', () => {
  for (let i = 0; i < 100_000; i++) {
    reflectProxy.number
  }
})

t.test('Basic proxy get', () => {
  for (let i = 0; i < 100_000; i++) {
    basicProxy.number
  }
})

t.test('Empty proxy get', () => {
  for (let i = 0; i < 100_000; i++) {
    emptyProxy.number
  }
})

t.test('Native set', () => {
  for (let i = 0; i < 100_000; i++) {
    native.number = Math.random()
  }
})

t.test('Reflect proxy set', () => {
  for (let i = 0; i < 100_000; i++) {
    reflectProxy.number = Math.random()
  }
})

t.test('Basic proxy set', () => {
  for (let i = 0; i < 100_000; i++) {
    basicProxy.number = Math.random()
  }
})

t.test('Empty proxy set', () => {
  for (let i = 0; i < 100_000; i++) {
    emptyProxy.number = Math.random()
  }
})

t.runTests(100,13)
t.writeStats('results - proxyIncrement.txt')
