// noinspection DuplicatedCode

/**
 * Unfortunately this file is a bit of a mess, since the ES6 imports cannot handle circular references, all the
 * handlers must be inside one big file... Sorry about that
 */

import {SYMBOLS} from "@Lib/shared/SYMBOLS";
import {ALIAS} from "@Lib/shared/ALIAS";
import {isEmpty, isTrackableArray, isUntrackableArray, merge} from "@Lib/util/objUtil";
import {META_COMMANDS_FACTORY} from "@Lib/shared/proxies/ArrayMetaCommand";

const {sProxy, sContainer, sLevel, sPristine, sHandler, sLow} = SYMBOLS

/**
 * Special handler whose task is to allow the developer to make changes marked as low priority and to chain them easily.
 */
export class LowPrioHandler {
  constructor(lowPrioChanges, pristine, parentHandler) {
    this.lowPrioChanges = lowPrioChanges
    this.pristine = pristine
    this.parentHandler = parentHandler
  }

  /**
   * Alters the object's state and marks the change as low priority
   * @param key {string}
   * @param value {*}
   * @return {LowPrioHandler} itself for easy 'set' chaining
   */
  set(key, value) {
    this.parentHandler.container.handlersWithChanges.add(this.parentHandler)
    this.pristine[key] = value
    this.lowPrioChanges[key] = value
    return this
  }
}

/**
 * Handler for proxy that is wrapping an object.
 *
 * If a handler detects a change in its object, it marks itself to the container. When the container is asked to propagate
 * changes, each of the marked handlers are then asked to add their local changes on the wrapped object to the whole
 * container changes message. If one object is referenced at multiple parts of the container state, only one handler is
 * created, and it's parent properties now contains all the positions in the state where the reference is located.
 * During the state propagation, the local changes are then written to all the parent's positions.
 *
 * The handlers are created lazily and only after the objects in the pristine state are first accessed of changed.
 *
 * The handlers create a hierarchical structure of parents and children, so they properly track where to put their local
 * changes in the grander scheme of container-level changes.
 *
 * The parent structure is a map of sets. Keys of the map are the parent handlers, and inside the set are the keys
 * they are accessible under in their parents. We can be parented to an object, that has multiple keys to access us.
 */
export class ObjectProxyHandler {
  constructor(container, parentHandler, key, pristine) {
    /** The container of which the wrapped object is part of */
    this.container = container
    /** Reference to the unwrapped object */
    this.pristine = pristine
    /** Parent proxies this handler is child of */
    this.parents = new Map()
    /** Latest merge changes made to the wrapped object */
    this.latestMerges = {}
    /** Latest delete changes made to the wrapped object */
    this.latestDeletes = {}
    /** Latest low prio merge changes made to the wrapped object */
    this.lowPrioChanges = {}

    if (parentHandler) {
      const set = new Set() // Since string is iterable, it will fill the set with the letters from the string instead
      set.add(key)
      this.parents.set(parentHandler, set)
    }
  }

  /**
   * Handler for 'get' trap.
   * @param target
   * @param prop
   * @param receiver
   * @return {ObjectProxyHandler|LowPrioHandler|*}
   */
  get(target, prop, receiver) {
    switch (prop) {
      case sPristine:
        // Allow to get the pristine reference. For experienced users only.
        return this.pristine
      case sHandler:
        // Allow to access the handler itself. For experienced users only.
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

    // If our target is an object, lazy load its proxy
    if (typeof target[prop] === 'object') {
      // If we are getting a trackable array that is not yet proxied, proxy it
      if (!target[prop][sProxy] && isTrackableArray(target[prop])) {
        target[prop][sProxy] = new Proxy(target[prop], new ArrayProxyHandler(this.container, this, prop, this.pristine[prop]))
      }
      // If we are getting an object that is not yet proxied, proxy it
      else if (!target[prop][sProxy] && !isUntrackableArray(target[prop])) {
        target[prop][sProxy] = new Proxy(target[prop], new ObjectProxyHandler(this.container, this, prop, target[prop]))
      }
      return target[prop][sProxy]
    }
    return target[prop]
  }

  /**
   * Handler for the 'set' trap
   * @param target
   * @param prop
   * @param value
   * @param receiver
   * @return {boolean}
   */
  set(target, prop, value, receiver) {
    // Do not waste memory by recording 'changes' that do not change anything
    if (target[prop] === value) return true;
    this.container.handlersWithChanges.add(this)

    // If we replace something that was tracked before, remove the dependency (parent-child link)
    this._removeChildDependency(this.pristine, prop)

    // If we set and already wrapped value, add us to their parents list
    if (value[sProxy]) {
      target[prop] = value[sPristine] // make sure we do not replace the reference with the proxy one to still allow us to make pristine changes
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
      target[prop] = value
      const handler = new ArrayProxyHandler(this.container, this, prop, value)
      const proxy = new Proxy(value, handler)
      target[prop][sProxy] = proxy
      // if (value === lastArrayFilteredResult && previousValue[sProxy] && previousValue[sProxy][sHandler] === lastArrayFilteredOriginalHandler) {
      //   handler.origin = lastArrayFilteredOriginalHandler.origin
      //   handler.requiresFullCompare = lastArrayFilteredOriginalHandler.requiresFullCompare
      //   handler.localChanges.push(lastArrayFilteredChanges)
      // }
    }
    else {
      target[prop] = value
    }
    this.latestMerges[prop] = value
    delete this.latestDeletes[prop] // If we deleted a value under this key, now we set it to a new value and we no longer need to delete it

    return true;
  }

  /**
   * Handler for a 'delete' trap
   * @param target
   * @param prop
   * @return {boolean}
   */
  deleteProperty(target, prop) {
    // Well technically we should limit deletion of the sProxy and other symbols, but why would anyone want to do that?
    // Now we can at least save up some operations that would be used on some if calls
    if (target[prop] === undefined) { return true } // cannot delete key that is not present

    // If we are removing an already wrapped child, remove us from their parents list under that key (prop)
    const toDelete = target[prop]?.[sProxy]?.[sHandler]
    if (toDelete) {
      const set = toDelete.parents.get(this)
      if (set) {set.delete(prop)}
    }
    this.latestDeletes[prop] = true
    delete this.latestMerges[prop] // If we tracked a merge change before, remove it
    delete target[prop]
    this.container.handlersWithChanges.add(this)

    return true
  }

  /**
   * Utility method that checks whether there is any value under the prop, and if it is an already wrapped object, remove
   * us from their parents list under that key (prop).
   * @param target
   * @param prop
   * @private
   */
  _removeChildDependency(target, prop) {
    const toDelete = target[prop]?.[sProxy]?.[sHandler]
    if (toDelete) {
      const set = toDelete.parents.get(this)
      if (set) {set.delete(prop)}
    }
  }

  /**
   * Write all the locally tracked changes to all the relevant positions in the container-scoped synchronization message.
   */
  propagateChanges() {
    let deletes = {[ALIAS.KEY_DEL]: []}
    for (const k in this.latestDeletes) {
      deletes[ALIAS.KEY_DEL].push(k)
    }
    if (deletes[ALIAS.KEY_DEL].length === 0) {
      deletes = {}
    }

    const branches = gatherBranches(this) // Find all places in the container where we are referenced.
    // Write the changes to all that places.
    stepThrough(this.container.merges, branches, this.latestMerges)
    stepThrough(this.container.deletes, branches, deletes)
    stepThrough(this.container.lowPrio, branches, this.lowPrioChanges)

    this.latestMerges = {}
    this.lowPrioChanges = {}
    this.latestDeletes = {}

    this.localChanges = []
  }
}

/**
 * Steps through the synchronization message and writes the local changes to all the relevant places specified by the branches
 * @param start {object} top level of the message
 * @param branches {string[]} all the places we need to write the changes
 * @param object {object} object representing the changes
 */
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

/**
 * Goes through all the parents of this handler and reports back all the places it found that we are referenced at.
 * @param searchStart
 * @return {string[]} list of all branches
 */
function gatherBranches(searchStart) {
  const branches = []
  branch([], searchStart, branches)
  return branches
}

/**
 * Recursive part of the gatherBranches algorithm
 * @param progress
 * @param next
 * @param branches
 */
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

// let lastArrayFilteredOriginalHandler = null
// let lastArrayFilteredResult = null
// let lastArrayFilteredChanges = null

/**
 * This is a specific variant of {@link ObjectProxyHandler} that is tailored to be used in conjunction with arrays, as
 * it tracks their index changes a bit more thoroughly, resulting in 'meta' commands.
 */
export class ArrayProxyHandler extends ObjectProxyHandler {
  constructor(container, parentHandler, key, pristine) {
    super(container, parentHandler, key, pristine)
    /** If full-compare changes are detected, this is the structure the array had at the end of the last sync. cycle */
    this.origin = null // filled only when a first change after latest sync happens
    /** Says if a full-compare change was committed to this array */
    this.requiresFullCompare = false
  }

  /**
   * Returns a wrapped version of filter that operates on the native array and then returns an array of removed indices.
   * Currently not used in favor of more consistent and less buggy (but not so efficient) full compare.
   * @param filterFn the filter fn
   * @param newThis optional second parameter for filter
   * @return {*}
   */
  // filterWrap(filterFn, newThis) {
  //   const filteredIndices = []
  //   newThis = newThis ? newThis : this.pristine
  //   const filteredArray = this.pristine.filter((element, index, array) => {
  //     const result = filterFn.call(newThis, element, index, array)
  //     if (!result) {
  //       filteredIndices.push(index)
  //     }
  //     return result
  //   }, newThis)
  //   // x console.log('changes', filteredIndices, filteredArray);
  //   lastArrayFilteredResult = filteredArray
  //   lastArrayFilteredChanges = filteredIndices
  //   return filteredArray;
  // }

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
