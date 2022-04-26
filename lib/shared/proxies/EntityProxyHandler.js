import {SYMBOLS} from "@Lib/shared/SYMBOLS";
import {ALIAS} from "@Lib/shared/ALIAS";
import {isEmpty, isTrackableArray, isUntrackableArray, merge} from "@Lib/objUtil";

const {sProxy, sContainer, sLevel, sPristine, sHandler} = SYMBOLS

export class LowProxyHandler {

}

export class ArrayProxyHandler {

}

export class EntityProxyHandler {
  constructor(container, parentHandler, key, pristine) {
    this.container = container
    this.pristine = pristine // todo: most likely not gonna be used
    this.parents = new Map()
    this.localChanges = []

    if (parentHandler) {
      this.parents.set(parentHandler, key)
    }
  }

  get(target, prop, receiver) {
    if (prop === sPristine) {
      console.log('is this the handler?', this);
      return this.pristine
    }
    if (prop === sHandler) {
      return this
    }
    if (prop === sProxy) {
      return target[prop]
    }
    if (prop === ALIAS.KEY_LOW) {
      return new LowProxyHandler() // todo
    }
    if (prop === 'toJson') {
      // This should make it so the toJSON works with the pristine version, so with the faster version
      return Reflect.get(target, prop, receiver)
    }

    // If our target is an object, lazy load its proxy
    if (typeof target[prop] === 'object' && !(Array.isArray(target[prop]))) {
      if (isTrackableArray(target[prop]) && !target[prop][sProxy]) {
        // todo; old args: this.container, this, prop, pristine[prop]
        target[prop][sProxy] = new Proxy(target[prop], new ArrayProxyHandler())
      }
      else if (!isUntrackableArray() && !target[prop][sProxy]) {
        target[prop][sProxy] = new Proxy(target[prop], new EntityProxyHandler(this.container, this, prop, target[prop]))
      }
      return target[prop][sProxy]
    }
    return target[prop]
  }

  set(target, prop, value, receiver) {
    if (target[prop] === value) return;
    this.container.handlersWithChanges.add(this)
    if (value[sProxy]) {
      target[prop] = value[sPristine]
      value[sHandler].parents.set(this, prop)
    }
    else {
      target[prop] = value
    }
    this.localChanges.push([0, prop, value])

    return true;
  }

  deleteProperty(target, prop) {
    console.log('delete called', target, prop);
    if (!target[prop]) { return true }
    const toDelete = target[prop]?.[sProxy]?.[sHandler]
    if (toDelete) {
      toDelete.parents.delete(this)
    }
    this.localChanges.push([1, prop])
    console.log(this.localChanges);
    this.container.handlersWithChanges.add(this)
    delete target[prop]
    return true
  }

  propagateChanges() {
    const merges = {}
    const deletes = {}
    // const meta = {} // meta is only for arrays, objects can do with simple merges and deletes
    for (const c of this.localChanges) {
      switch (c[0]) {
        case 0:
          merges[c[1]] = c[2]
          delete deletes[c[1]]
          break;
        case 1:
          if (!deletes[ALIAS.KEY_DEL]) {deletes[ALIAS.KEY_DEL] = []}
          deletes[ALIAS.KEY_DEL].push(c[1])
          console.log('added one delete', c[1]);
          delete merges[c[1]]
          break;
        default:
          throw new Error(`Unknown command (${c[0]}) for changes propagation in EntityProxyHandler`)
      }
    }
    const branches = gatherBranches(this)
    stepThrough(this.container.merges, branches, merges)
    stepThrough(this.container.deletes, branches, deletes)
    this.localChanges = []
  }
}

function stepThrough(start, branches, object) {
  if (!isEmpty(object)) {
    for (const b of branches) {
      let cursor = start
      for (let i = b.length - 1; i >= 0; i--) {
        if (!cursor[b[i]]) {
          cursor[b[i]] = {}
        }
        cursor = cursor[b[i]]
      }
      merge(cursor, object)
    }
  }
}

function gatherBranches(searchStart) {
  const branches = []
  branch([], searchStart, branches)
  return branches
}

function branch(progress, next, branches) {
  // console.log('branching', [...progress], next, branches);
  if (next.parents.size === 0) {
    // Check that the end of the chain is the root (container.pristine)
    // If it is not, then the chain got disconnect along the way by deleting upper property, taking us with it
    // a = {b: {c: {d: 10}}}
    // delete a.b.c.d
    // delete a.b => causes the chain to disconnect between b and c; if the check that is on the line below wasn't there
    // then we would also tell 'a' to delete 'd', as the 'c' object would think it reached the top and added its LOCAL
    // deletion to the root ('a')
    if (next === next.container.proxy[sHandler]) {
      branches.push(progress)
    }
  }
  else {
    for (const p of next.parents) {
      progress.push(p[1])
      branch(progress, p[0], branches)
    }
  }
}
