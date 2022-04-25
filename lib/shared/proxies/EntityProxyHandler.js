import {SYMBOLS} from "@Lib/shared/SYMBOLS";
import {ALIAS} from "@Lib/shared/ALIAS";
import {isEmpty, isTrackableArray, isUntrackableArray, merge} from "@Lib/objUtil";

const {sProxy, sContainer, sLevel, sPristine} = SYMBOLS

export class LowProxyHandler {

}

export class ArrayProxyHandler {

}

export class EntityProxyHandler {
  constructor(container, parentHandler, key, pristine) {
    this.container = container
    this.pristine = pristine // todo: most likely not gonna be used
    this.parents = new Map()
    this.parents.set(parentHandler, key)
    this.localChanges = []
  }

  get(target, prop, receiver) {
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
    target[prop] = value;
    if (value[sProxy]) {
      value[sProxy].parents.add(this)
    }
    this.localChanges.push([0, prop, value])

    return true;
  }

  deleteProperty(target, prop) {
    const toDelete = target[prop]?.[sProxy]
    if (toDelete) {
      toDelete.parents.delete(this)
    }
    this.localChanges.push([1, prop])
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
          deletes[c[1]] = true
          delete merges[c[1]]
          break;
        default:
          throw new Error(`Unknown command (${c[0]}) for changes propagation in EntityProxyHandler`)
      }
    }
    const branches = setupBranches(this, merges, deletes)
    stepThrough(this.container.merges, branches, merges)
    stepThrough(this.container.deletes, branches, deletes)
  }
}

function setupBranches(handler, merges, deletes) {
  return gatherBranches(handler)
}

function stepThrough(start, branches, object) {
  if (!isEmpty(object)) {
    for (const b of branches) {
      let cursor = start
      for (let i = b.length - 1; i > 0; i++) {
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
  if (next.parents.size === 0) {
    branches.push(progress)
  }
  else {
    for (const p of this.parents) {
      branch(progress.push(p[1]), p[0], branches)
    }
  }
}
