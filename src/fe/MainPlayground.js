import {EntityContainer} from "@Lib/shared/containers/EntityContainer";
import {pack} from 'msgpackr'

const proxyE = document.getElementById('proxy');
const simE = document.getElementById('sim');
const changesE = document.getElementById('changes');
const clearE = document.getElementById('clear');

const c = new EntityContainer()
c.proxy.x = 50
c.proxy.x
delete c.proxy.x

const obj = {a: {b: 5, c: 6}, e: 40}
const proxy = new Proxy(obj, {
  get(target, prop, value) {
    console.log('Get triggered for prop', prop);
    if (prop === 'a') {
      return target.e
    }
    return target[prop]
  },
  set(target,prop,value, receiver) {
    if (prop === 'x') {
      console.log('speial trigger, getting a for fun');
      console.log('is a a or e?', this.get(target, 'a', receiver));
    }
    target[prop] = value
    return true
  }
})
proxy.x = 5

window.pack = pack

window.con = c
window.p = c.proxy;
window.c = c.pristine;
window.ch = c.merges;
window.m = c.meta
window.d = c.deletes
