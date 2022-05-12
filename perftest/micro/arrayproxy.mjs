import * as t from './Library.mjs'
let array,array2,array3, proxy,smartproxy;

t.beforeEach(()=>{
  array = []
  for (let i = 0; i < 150_000; i++) {
    array.push(Math.random())
  }
  array2 = [].concat(array)
  array3 = [].concat(array)

  proxy = new Proxy(array2, {  })

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
    set(a,b,c,d) {
      a[b] = c
      return true
    }
  })
})

t.test('Native sort', ()=>{
  array.sort()
})

t.test('Proxy sort', ()=>{
  proxy.sort()
})

t.test('Smart proxy sort', ()=>{
  smartproxy.sort()
})

t.test('Native filter', ()=>{
  array.filter((a)=>{return a > 0.5})
})

t.test('Proxy filter', ()=>{
  proxy.filter((a)=>{return a > 0.5})
})

t.test('Smart proxy filter', ()=>{
  smartproxy.filter((a)=>{return a > 0.5})
})

t.test('Native push', ()=>{
  for (let i = 0; i < 10_000; i++) {
    array.push(i)
  }
})

t.test('Proxy push', ()=>{
  for (let i = 0; i < 10_000; i++) {
    proxy.push(i)
  }
})

t.test('Smart proxy push', ()=>{
  for (let i = 0; i < 10_000; i++) {
    smartproxy.push(i)
  }
})

t.runTests()
