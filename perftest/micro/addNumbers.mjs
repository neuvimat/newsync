import * as t from './Library.mjs'

let native, proxy1, proxy2, toBeProxied1, toBeProxied2;

t.beforeEach(() => {
  native = {number: 0}
  toBeProxied1 = {number: 0}
  toBeProxied2 = {number: 0}
  proxy1 = new Proxy(toBeProxied1, {get(a,b,c) {return Reflect.get(a,b,c)}})
  proxy2 = new Proxy(toBeProxied2, {
      totalgets: 0,
      totalsets: 0,
      get(a, b, c) {
        this.totalgets++;
        return a[b]
      },
      set(a, b, c, d) {
        this.totalsets++;
        a[b] = c
        return true
      }
    }
  )
})

t.test('Native add', () => {
  for (let i = 0; i < 100_000; i++) {
    native.number = native.number + 1
  }
})

t.test('Empty proxy add', () => {
  for (let i = 0; i < 100_000; i++) {
    proxy1.number = proxy1.number + 1
  }
})

t.test('Logging proxy add', () => {
  for (let i = 0; i < 100_000; i++) {
    proxy2.number = proxy2.number + 1
  }
})

t.runTests()
