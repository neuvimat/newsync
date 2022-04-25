import {EntityContainer} from "@Lib/shared/containers/EntityContainer";
import {pack} from 'msgpackr'
import {clear} from "@Lib/objUtil";

const proxyE = document.getElementById('proxy');
const simE = document.getElementById('sim');
const changesE = document.getElementById('changes');
const clearE = document.getElementById('clear');

const c = new EntityContainer()
c.proxy.a = 40
c.proxy.b = {x: 40}
c.proxy.c = {k: {d: 15}, g: 15}

console.log('proxy', c.proxy);
console.log('pristine', c.pristine);

console.log('--- check merges and deletes; should be empty, because we did not propagate');
console.log('pristine', c.pristine);
console.log('merges', c.merges);
console.log('deletes', c.deletes);

console.log('changed handlers',c.handlersWithChanges)

c.propagateChanges()
console.log('--- after changes propagations');

console.log('pristine', c.pristine);
console.log('merges', c.merges);
console.log('deletes', c.deletes);

c.proxy.b.x = 15
c.proxy.d = 7
c.propagateChanges()
console.log('--- after basic changes propagations');

console.log('pristine', c.pristine);
console.log('merges', c.merges);
console.log('deletes', c.deletes);

console.log();

// delete c.proxy.a
// delete c.proxy.b
// c.proxy.c
delete c.proxy.c.g
delete c.proxy.c.k
delete c.proxy.c
// delete c.proxy.d
c.propagateChanges()
console.log('--- after some deletes');

console.log('pristine', c.pristine);
console.log('merges', c.merges);
console.log('deletes', c.deletes);
