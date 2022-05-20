import {ObjectProxyHandler} from "@Lib/shared/proxies/ObjectProxyHandler";

import {SYMBOLS} from "@Lib/shared/SYMBOLS";
import {merge} from "@Lib/util/objUtil";
import {ALIAS} from "@Lib/shared/ALIAS";
import {IContainer} from "@Lib/shared/container/IContainer";

const {sProxy, sContainer, sLevel, sPristine} = SYMBOLS

/**
 * Represents a top-level unit of application state that is able to automatically detect any changes made to its state
 * that is exposed under the 'proxy' property. You can also alter the state directly without automatic changes detection
 * by accessing the state via 'pristine' property.
 * @implements IContainer
 */
export class ObjectContainer extends IContainer {
  constructor() {
    super()
    this.handlersWithChanges = new Set()
    this.arrayHandlersWithChanges = new Set()
    this.lowHandlersWithChanges = new Set()

    this._pristine = {}
    /** Proxy reference to the container's state that automatically tracks changes. */
    this.proxy = {}

    /** Object representing merge changes for low priority changes */
    this.lowPrio = {}   // low prio only supports merges
    /** Object representing merge changes needed to achieve synchronization */
    this.merges = {}    // auto merge
    /** Object representing delete changes needed to achieve synchronization */
    this.deletes = {}   // delete all
    /** Object representing meta changes needed to achieve synchronization */
    this.meta = {}      // meta commands (mostly for arrays); the most basic (delete, merge, replace) are separate to conserve space

    this.proxy = new Proxy(this._pristine, new ObjectProxyHandler(this, null, null, this._pristine))
    this._pristine[sProxy] = this.proxy
  }

  set pristine(value) {
    this._pristine = {}
    this.proxy = new Proxy(this._pristine, new ObjectProxyHandler(this, []))
    this._pristine[sProxy] = this.proxy
    this.merges = {...this._pristine} // When we set a different object as this, the changes is that whole object
    this.deletes = {}
    this.meta = {}

    this.handlersWithChanges.clear() // maybe just disallow changing the container state and thus its proxies
  }

  /**
   * Pristine reference to the container's state, does not automatically track changes.
   * @return {*|{}}
   */
  get pristine() {
    return this._pristine
  }

  propagateChanges() {
    for (const h of this.handlersWithChanges) {
      h.propagateChanges()
    }
  }

  init() {

  }

  clear() {
    this.handlersWithChanges.clear()
    this.arrayHandlersWithChanges.clear()
    this.lowHandlersWithChanges.clear()
    this.merges = {}
    this.deletes = {}
    this.meta = {}
    this.lowPrio = {}
  }

  set(path, value) {
    const keys = path.split('.')

    // Step through the pristine object
    this._stepThroughSet(this.pristine, keys, value);

    // Step through the merges object
    this._stepThroughSet(this.merges, keys, value);
  }

  delete(path) {
    const keys = path.split('.')
    const lastKey = keys[keys.length-1]
    if (keys.length === 0) return

    this._stepThroughDelete(this.pristine, keys)
    this._stepThroughDeletes(this.deletes, keys)
  }

  _stepThroughSet(cursor, keys, value) {
    const lastKey = keys[keys.length-1]
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cursor[keys[i]]) {
        cursor[keys[i]] = {}
      }
      cursor = cursor[keys[i]]
    }
    if (typeof value === 'object') {
      cursor[lastKey] = {}
      merge(cursor[lastKey], value)
    }
    else {
      cursor[lastKey] = value
    }
    return cursor;
  }

  _stepThroughDelete(cursor, keys) {
    const lastKey = keys[keys.length-1]
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cursor[keys[i]]) {
        cursor[keys[i]] = {}
      }
      cursor = cursor[keys[i]]
    }
    delete cursor[lastKey]
    return cursor;
  }

  _stepThroughDeletes(cursor, keys) {
    const lastKey = keys[keys.length-1]
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cursor[keys[i]]) {
        cursor[keys[i]] = {}
      }
      cursor = cursor[keys[i]]
    }
    if (!cursor[ALIAS.KEY_DEL]) {
      cursor[ALIAS.KEY_DEL] = []
    }
    cursor[ALIAS.KEY_DEL].push(lastKey)
    return cursor;
  }
}
