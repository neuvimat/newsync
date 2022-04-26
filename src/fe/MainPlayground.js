import {ObjectContainer} from "@Lib/shared/containers/ObjectContainer";
import {pack} from 'msgpackr'
import {clear} from "@Lib/objUtil";

const proxyE = document.getElementById('proxy');
const simE = document.getElementById('sim');
const changesE = document.getElementById('changes');
const clearE = document.getElementById('clear');

const c = new ObjectContainer()

/*
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
delete c.proxy.c.k.d
delete c.proxy.c
// delete c.proxy.d
c.propagateChanges()
console.log('--- after some deletes');

console.log('pristine', c.pristine);
console.log('merges', c.merges);
console.log('deletes', c.deletes);
 */

console.log('-- Setup changes');
c.proxy.lol = {a:40,b:15}
c.propagateChanges()
console.log('c.merges', c.merges);
console.log('c.deletes', c.deletes);
console.log('c.meta', c.meta);
console.log('c.pristine', c.pristine);


console.log('-- set shallow reference');
c.proxy.xd = c.proxy.lol
c.propagateChanges()
console.log('c.merges', c.merges);
console.log('c.deletes', c.deletes);
console.log('c.meta', c.meta);
console.log('c.pristine', c.pristine);

console.log('-- set shallow reference');
c.proxy.xd.p = 5
c.propagateChanges()
console.log('c.merges', c.merges);
console.log('c.deletes', c.deletes);
console.log('c.meta', c.meta);
console.log('c.pristine', c.pristine);
