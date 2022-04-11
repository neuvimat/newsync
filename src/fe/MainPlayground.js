import {makeSimpleRecursiveProxy} from "../../lib/shared/SimpleProxy";
import {clear} from "../../lib/objUtil";

const proxyE = document.getElementById('proxy');
const simE = document.getElementById('sim');
const changesE = document.getElementById('changes');
const clearE = document.getElementById('clear');

const {changes, pristine, proxy} = makeSimpleRecursiveProxy()

const iters = 1
const perIter = 10_000_000

for (let i = 0; i < iters; i++) {
  // const pristine = {}
  // const proxy = new Proxy(pristine, {
  //   get(t, p, r) {return t[p]}, set(t, p, v) {
  //     t[p] = v;
  //     return true
  //   }
  // })

  let t1 = performance.now()
  for (let j = 0; j < perIter; j++) {
    proxy[j] = j
  }
  let t2 = performance.now()
  let t3 = performance.now()
  for (let j = 0; j < perIter; j++) {
    pristine[j] = j
  }
  let t4 = performance.now()
  let t5 = performance.now()
  for (let j = 0; j < perIter; j++) {
    proxy[j]
  }
  let t6 = performance.now()
  let t7 = performance.now()
  for (let j = 0; j < perIter; j++) {
    pristine[j]
  }
  let t8 = performance.now()
  changesE.innerHTML += `<div><h1>TEST RUN ${i}</h1></div>`
  changesE.innerHTML += `<div><h2>WRITE</h2></div>`
  changesE.innerHTML += `<div>Proxy: ${(t2 - t1) / 1000}ms</div>`
  changesE.innerHTML += `<div>Pristine: ${(t4 - t3) / 1000}ms</div>`
  changesE.innerHTML += `<div><h2>READ</h2></div>`
  changesE.innerHTML += `<div>Proxy: ${(t6 - t5) / 1000}ms</div>`
  changesE.innerHTML += `<div>Pristine: ${(t8 - t7) / 1000}ms</div>`
}

window.p = proxy;
window.s = sim;
window.changes = changes;
