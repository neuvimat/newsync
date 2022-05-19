// noinspection DuplicatedCode

/**
 * Unfortunately this file is a bit of a mess, since the ES6 imports cannot handle circular references, all the
 * handlers must be inside one big file... Sorry about that
 */

import {SYMBOLS} from "@Lib/shared/SYMBOLS";
import {ALIAS} from "@Lib/shared/ALIAS";
import {isEmpty, isTrackableArray, isUntrackableArray, merge} from "@Lib/objUtil";
import {META_COMMANDS_FACTORY} from "@Lib/shared/proxies/ArrayMetaCommand";

const {sProxy, sContainer, sLevel, sPristine, sHandler, sLow} = SYMBOLS

export class LowPrioHandler {
  constructor(lowPrioChanges, pristine, parentHandler) {
    this.lowPrioChanges = lowPrioChanges
    this.pristine = pristine
    this.parentHandler = parentHandler
  }

  set(key, value) {
    this.parentHandler.container.handlersWithChanges.add(this.parentHandler)
    this.pristine[key] = value
    this.lowPrioChanges[key] = value
    return this
  }
}

export class ObjectProxyHandler {
  constructor(container, parentHandler, key, pristine) {
    this.container = container
    this.pristine = pristine
    this.parents = new Map()
    this.latestMerges = {}
    this.latestDeletes = {}
    this.lowPrioChanges = {}

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
        return new LowPrioHandler(this.lowPrioChanges, this.pristine, this)
      case 'toJSON':
        // This should make it so the toJSON works with the pristine version, so with the faster version
        return this.pristine.toJSON
      default:
    }

    // x console.log('getting prop', prop);
    // If our target is an object, lazy load its proxy
    if (typeof target[prop] === 'object') {
      // x console.log('it is an object');
      if (isTrackableArray(target[prop]) && !target[prop][sProxy]) {
        // x console.log('it is trackable array and is not tracked yet!');
        target[prop][sProxy] = new Proxy(target[prop], new ArrayProxyHandler(this.container, this, prop, this.pristine[prop]))
      }
      else if (!isUntrackableArray() && !target[prop][sProxy]) {
        // x console.log('it is just an untracked object, making tracked object');
        target[prop][sProxy] = new Proxy(target[prop], new ObjectProxyHandler(this.container, this, prop, target[prop]))
      }
      return target[prop][sProxy]
    }
    return target[prop]
  }

  set(target, prop, value, receiver) {
    // !important, do not waste memory by recording 'changes' that do not change anything
    // x console.log('setting', prop, value);
    if (target[prop] === value) return true;
    this.container.handlersWithChanges.add(this)

    // If we replace something that was tracked before, remove the dependency
    this._removeChildDependency(this.pristine, prop)

    if (value[sProxy]) {
      target[prop] = value[sPristine]
      const parents = value[sHandler].parents.get(this)
      if (parents) {
        parents.add(prop)
      }
      else {
        const set = new Set() // Since string is iterable, it would fill the set with the letters from the string
                              // instead if added the prop in the constructor itself
        set.add(prop)
        value[sHandler].parents.set(this, set)
      }
    }
    else if (isTrackableArray(value)) {
      const previousValue = target[prop]
      // x console.log('its a trackable Array!');
      target[prop] = value
      const handler = new ArrayProxyHandler(this.container, this, prop, value)
      const proxy = new Proxy(value, handler)
      target[prop][sProxy] = proxy
      if (value === lastArrayFilteredResult && previousValue[sProxy] && previousValue[sProxy][sHandler] === lastArrayFilteredOriginalHandler) {
        // x console.log('holy shit it works!');
        handler.origin = lastArrayFilteredOriginalHandler.origin
        handler.requiresFullCompare = lastArrayFilteredOriginalHandler.requiresFullCompare
        handler.localChanges.push(lastArrayFilteredChanges)
      }
    }
    else {
      // x console.log('Will be lazy proxied');
      target[prop] = value
    }
    this.latestMerges[prop] = value
    delete this.latestDeletes[prop]

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
    this.latestDeletes[prop] = true
    delete this.latestMerges[prop]
    delete target[prop]
    this.container.handlersWithChanges.add(this)

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
    let deletes = {[ALIAS.KEY_DEL]: []}
    for (const k in this.latestDeletes) {
      deletes[ALIAS.KEY_DEL].push(k)
    }
    if (deletes[ALIAS.KEY_DEL].length === 0) {
      deletes = {}
    }

    const branches = gatherBranches(this)
    stepThrough(this.container.merges, branches, this.latestMerges)
    stepThrough(this.container.deletes, branches, deletes)
    stepThrough(this.container.lowPrio, branches, this.lowPrioChanges)

    this.latestMerges = {}
    this.lowPrioChanges = {}
    this.latestDeletes = {}

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

let lastArrayFilteredOriginalHandler = null
let lastArrayFilteredResult = null
let lastArrayFilteredChanges = null

export class ArrayProxyHandler extends ObjectProxyHandler {
  constructor(container, parentHandler, key, pristine) {
    super(container, parentHandler, key, pristine)
    this.origin = null // filled only when a first change after latest sync happens
    this.requiresFullCompare = false
  }

  /**
   * Returns a wrapped version of filter that operates on the native array and then returns an array of removed indices.
   * Currently not used in favor of more consistent and less buggy (but not so efficient) full compare.
   * @param filterFn the filter fn
   * @param newThis optional second parameter for filter
   * @return {*}
   */
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
    // x console.log('changes', filteredIndices, filteredArray);
    lastArrayFilteredResult = filteredArray
    lastArrayFilteredChanges = filteredIndices
    return filteredArray;
  }

  get(target, prop, receiver) {
    // x console.log('Array handler is getting', prop);
    switch (prop) {
      case 'map':
      case 'filter':
      case 'push':
      case 'splice':
      case 'slice':
      case 'concat':
      case 'fill':
      case 'pop':
      case 'reverse':
      case 'shift':
      case 'sort':
      case 'unshift':
        // Due to some issues and bugs, use full compare for now in every of the methods listed above
        this._saveOrigin()
        // Return the faster, native method for faster processing, since we will do full compare at the end anyway
        return (...args)=>{return this.pristine[prop](...args)}
      case sPristine:
        return this.pristine
      case sHandler:
        return this
      case sProxy:
        // this case is a fix for infinite loop => proxy is just another object, that does not have sProxy symbol, so
        // the code tried to make endless proxies out the main one due to the lazy loading
        return target[prop]
      case sLow:
        return new LowPrioHandler(this.lowPrioChanges, this.pristine, this)
      case 'toJSON':
        // This should make it so the toJSON works with the pristine version, so with the faster version
        return (...args)=>{return this.pristine.toJSON(...args)}
      default:
    }

    // If our target is an object, lazy load its proxy
    if (typeof target[prop] === 'object') {
      if (isTrackableArray(target[prop]) && !target[prop][sProxy]) {
        target[prop][sProxy] = new Proxy(target[prop], new ArrayProxyHandler(this.container, this, prop, this.pristine[prop]))
      }
      else if (!isUntrackableArray() && !target[prop][sProxy]) {
        target[prop][sProxy] = new Proxy(target[prop], new ObjectProxyHandler(this.container, this, prop, target[prop]))
      }
      return target[prop][sProxy]
    }
    return target[prop]
  }

  set(target, prop, value, receiver) {
    // !important, do not waste memory by recording 'changes' that do not change anything
    // x console.log('setting', prop, value);
    if (target[prop] === value) return true;
    this._saveOrigin()

    // If there was something tracked before at that prop, remove its dependency from here
    this._removeChildDependency(prop)

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

  _saveOrigin() {
    if (!this.origin) {
      this.container.handlersWithChanges.add(this)
      this.origin = [...this.pristine];
      this.requiresFullCompare = true
    }
  }

  _removeChildDependency(index) {
    const toDelete = this.pristine[index]?.[sProxy]?.[sHandler]
    if (toDelete) {
      const set = toDelete.parents.get(this)
      if (set) {set.delete(index)}
    }
  }

  _removeChildDependencies() {
    for (let i = 0; i < this.pristine.length; i++) {
      this._removeChildDependency(i)
    }
  }

  deleteProperty(target, prop) {
    // Well technically we should limit deletion of the sProxy and other symbols, but why would anyone want to do that?
    // Now we can at least save up some operations that would be used on some if calls
    if (target[prop] === undefined) { return true }
    this._saveOrigin()
    this._removeChildDependency(prop)
    delete target[prop]

    return true
  }

  propagateChanges() {
    const meta = [] // list of commands that will lead from the old (origin) array to its present
    const originMap = new Map()
    const nowMap = new Map()
    const {origin, pristine} = this

    for (let i = 0; i < origin.length; i++) {
      if (!originMap.has(origin[i])) {originMap.set(origin[i], i)}
    }

    for (let i = 0; i < pristine.length; i++) {
      if (pristine[i] == origin[i]) {continue} // No change here
      else if (originMap.has(pristine[i])) {
        meta.push(...META_COMMANDS_FACTORY.copyIndex(originMap.get(pristine[i]), i)) // command index for copy index
      }
      else {
        meta.push(...META_COMMANDS_FACTORY.setIndex(i, pristine[i]))
      }
    }

    // todo: optimize (detect many setIndices in a row as a one command of move range, etc.)

    if (pristine.length < origin.length) {
      meta.push(...META_COMMANDS_FACTORY.setLength(pristine.length))
    }

    const branches = gatherBranches(this)
    stepThrough(this.container.meta, branches, {[ALIAS.KEY_DEL]: meta}) // Reuse the key, even though now it means meta, not deletes

    this.origin = null
    this.requiresFullCompare = false
  }
}

export function fullCompare(before, now) {
  const changes = []
  const moves = []
  const news = new Map()
  const strays = []
  const copies = []
  const beforeElements = new Map()
  const nowElements = new Map()

  for (let i = 0; i < before.length; i++) {
    const e = before[i]
    const v = beforeElements.get(e)
    if (!v) {beforeElements.set(e, [i])}
    else {v.push(i)}
  }

  for (let i = 0; i < now.length; i++) {
    const e = now[i]
    const entry = beforeElements.get(e)
    if (!entry || entry.length === 0) {
      news.set(e, i)
    }
    else {
      e.shift()
    }
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
