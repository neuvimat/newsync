// noinspection DuplicatedCode

import {SYMBOLS} from "@Lib/shared/SYMBOLS";
import {ALIAS} from "@Lib/shared/ALIAS";
import {isEmpty, isTrackableArray, isUntrackableArray, merge} from "@Lib/objUtil";

const {sProxy, sContainer, sLevel, sPristine, sHandler, sLow} = SYMBOLS

export class LowProxyHandler {

}

export class ObjectProxyHandler {
  constructor(container, parentHandler, key, pristine) {
    this.container = container
    this.pristine = pristine
    this.parents = new Map()
    this.localChanges = []

    if (parentHandler) {
      const set = new Set() // Since string is iterable, it will fill the set with the letters from the string instead
      set.add(key)
      this.parents.set(parentHandler, set)
    }
  }

  get(target, prop, receiver) {
    switch (prop) {
      case sPristine:
        return this.pristine
      case sHandler:
        return this
      case sProxy:
        // this case is a fix for infinite loop => proxy is just another object, that does not have sProxy symbol, so
        // the code tried to make endless proxies out the main one due to the lazy loading
        return target[prop]
      case sLow:
        return new LowProxyHandler() // todo
      case 'toJSON':
        // This should make it so the toJSON works with the pristine version, so with the faster version
        return Reflect.get(target, prop, receiver)
      default:
    }

    console.log('getting prop', prop);
    // If our target is an object, lazy load its proxy
    if (typeof target[prop] === 'object') {
      console.log('it is an object');
      if (isTrackableArray(target[prop]) && !target[prop][sProxy]) {
        console.log('it is trackable array and is not tracked yet!');
        target[prop][sProxy] = new Proxy(target[prop], new ArrayProxyHandler(this.container, this, prop, this.pristine[prop]))
      }
      else if (!isUntrackableArray() && !target[prop][sProxy]) {
        console.log('it is just an untracked object, making tracked object');
        target[prop][sProxy] = new Proxy(target[prop], new ObjectProxyHandler(this.container, this, prop, target[prop]))
      }
      return target[prop][sProxy]
    }
    return target[prop]
  }

  set(target, prop, value, receiver) {
    // !important, do not waste memory by recording 'changes' that do not change anything
    console.log('setting', prop, value);
    if (target[prop] === value) return;
    this.container.handlersWithChanges.add(this)
    if (value === undefined) {
      this._removeChildDependency(target, prop)
      target[prop] = undefined
      return true
    }
    if (value[sProxy]) {
      target[prop] = value[sPristine]
      const parents = value[sHandler].parents.get(this)
      if (parents) {
        parents.add(prop)
      }
      else {
        const set = new Set() // Since string is iterable, it will fill the set with the letters from the string instead
        set.add(prop)
        value[sHandler].parents.set(this, set)
      }
    }
    else if (isTrackableArray(value)) {
      const previousValue = target[prop]
      console.log('its a trackable Array!');
      target[prop] = value
      const handler = new ArrayProxyHandler(this.container, this, prop, value)
      const proxy = new Proxy(value, handler)
      target[prop][sProxy] = proxy
      if (value === lastArrayFilteredResult && previousValue[sProxy] && previousValue[sProxy][sHandler] === lastArrayFilteredOriginalHandler) {
        console.log('holy shit it works!');
        handler.origin = lastArrayFilteredOriginalHandler.origin
        handler.requiresFullCompare = lastArrayFilteredOriginalHandler.requiresFullCompare
        handler.localChanges.push(lastArrayFilteredChanges)
      }
      return true
    }
    else {
      console.log('Will be lazy proxied');
      target[prop] = value
    }
    this.localChanges.push([0, prop, value])

    return true;
  }

  deleteProperty(target, prop) {
    // Well technically we should limit deletion of the sProxy and other symbols, but why would anyone want to do that?
    // Now we can at least save up some operations that would be used on some if calls
    if (target[prop] === undefined) { return true }
    const toDelete = target[prop]?.[sProxy]?.[sHandler]
    if (toDelete) {
      const set = toDelete.parents.get(this)
      if (set) {set.delete(prop)}
    }
    this.localChanges.push([1, prop])
    this.container.handlersWithChanges.add(this)
    delete target[prop]

    return true
  }

  _removeChildDependency(target, prop) {
    const toDelete = target[prop]?.[sProxy]?.[sHandler]
    if (toDelete) {
      const set = toDelete.parents.get(this)
      if (set) {set.delete(prop)}
    }
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
    for (const parent of next.parents) {
      const startingPoint = [...progress]
      for (const key of parent[1]) {
        let branchProgress = [...startingPoint]
        branchProgress.push(key)
        branch(branchProgress, parent[0], branches)
      }
    }
  }
}

const removeOne = 0
const removeArray = 1
const removeRange = 8
const removeStart = 10
const removeEnd = 10
const setOne = 2
const setArray = 3
const pushArray = 9
const sortArray = 4
const reverse = 5
const applyBitVector = 6
const applyReverseBitVector = 7

let lastArrayFilteredOriginalHandler = null
let lastArrayFilteredResult = null
let lastArrayFilteredChanges = null

export class ArrayProxyHandler extends ObjectProxyHandler {
  constructor(container, parentHandler, key, pristine) {
    super(container, parentHandler, key, pristine)
    this.origin = null // filled only when a first change after latest sync happens
    this.requiresFullCompare = false
  }

  filterWrap(filterFn, newThis) {
    const filteredIndices = []
    newThis = newThis ? newThis : this.pristine
    const filteredArray = this.pristine.filter((element, index, array) => {
      const result = filterFn.call(newThis, element, index, array)
      if (!result) {
        filteredIndices.push(index)
      }
      return result
    }, newThis)
    console.log('changes', filteredIndices, filteredArray);
    lastArrayFilteredResult = filteredArray
    lastArrayFilteredChanges = filteredIndices
    return filteredArray;
  }

  get(target, prop, receiver) {
    console.log('Array handler is getting', prop);
    switch (prop) {
      case 'filter':
        console.log('triggered lastArrayFilteredOriginalHandler', this);
        lastArrayFilteredOriginalHandler = this
        return (filterFn, newThis) => {return this.filterWrap(filterFn, newThis, this)}
      case 'push':
        return (value)=>{this.pristine.push(value)}
      case 'splice':
        return ''
      case 'slice':
        return ''
      case 'concat':
        return ''
      case 'fill':
        return ''
      case 'pop':
        return ''
      case 'reverse':
        return ''
      case 'shift':
        return ''
      case 'sort':
        return ''
      case 'unshift':
        return ''
      case sPristine:
        return this.pristine
      case sHandler:
        return this
      case sProxy:
        // this case is a fix for infinite loop => proxy is just another object, that does not have sProxy symbol, so
        // the code tried to make endless proxies out the main one due to the lazy loading
        return target[prop]
      case sLow:
        return new LowProxyHandler() // todo
      case 'toJSON':
        // This should make it so the toJSON works with the pristine version, so with the faster version
        return Reflect.get(target, prop, receiver)
      default:
    }

    // If our target is an object, lazy load its proxy
    if (typeof target[prop] === 'object' && !(Array.isArray(target[prop]))) {
      if (isTrackableArray(target[prop]) && !target[prop][sProxy]) {
        // todo; old args: this.container, this, prop, pristine[prop]
        target[prop][sProxy] = new Proxy(target[prop], new ArrayProxyHandler())
      }
      else if (!isUntrackableArray() && !target[prop][sProxy]) {
        target[prop][sProxy] = new Proxy(target[prop], new ObjectProxyHandler(this.container, this, prop, target[prop]))
      }
      return target[prop][sProxy]
    }
    return target[prop]
  }

  set(target, prop, value, receiver) {
    console.log('setting', prop, value);
    // !important, do not waste memory by recording 'changes' that do not change anything
    if (target[prop] === value) return true;
    if (this.previousState === null) {this.previousState = [...this.pristine]}
    this.container.handlersWithChanges.add(this)
    if (value[sProxy]) {
      target[prop] = value[sPristine]
      const parents = value[sHandler].parents.get(this)
      if (parents) {
        parents.add(prop)
      }
      else {
        const set = new Set() // Since string is iterable, it will fill the set with the letters from the string instead
        set.add(prop)
        value[sHandler].parents.set(this, set)
      }
    }
    else {
      target[prop] = value
    }
    this.localChanges.push([0, prop, value])

    return true;
  }

  deleteProperty(target, prop) {
    // Well technically we should limit deletion of the sProxy and other symbols, but why would anyone want to do that?
    // Now we can at least save up some operations that would be used on some if calls
    if (target[prop] === undefined) { return true }
    const toDelete = target[prop]?.[sProxy]?.[sHandler]
    if (toDelete) {
      const set = toDelete.parents.get(this)
      if (set) {set.delete(prop)}
    }
    this.localChanges.push([1, prop])
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

  fullCompare() {
    if (this.previousState === null) {return} // No changes
    this.origin // What the array started as like
    this.pristine // How it looks like now
  }
}

export function fullCompare(before, now) {
  const changes = []
  const beforeElements = new Map()
  const nowElements = new Map()

  for (const e of before) {

  }

  return changes
}

export function convertToProxy(target, container, parent, key) {
  if (target[sProxy] === undefined) {
    const proxy = new Proxy(target, new ObjectProxyHandler(container, parent, key, target))
    parent[key][sProxy] = proxy
  }
}

export class ArrayChain {

}