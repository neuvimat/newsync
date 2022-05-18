import {ObjectProxyHandler} from "@Lib/shared/proxies/ObjectProxyHandler";
import {FakeLongKeyDictionary} from "@Lib/shared/FakeLongKeyDictionary";

import {SYMBOLS} from "@Lib/shared/SYMBOLS";
import {clear} from "@Lib/objUtil";

const {sProxy, sContainer, sLevel, sPristine} = SYMBOLS

export class ObjectContainer {
  constructor() {
    this.handlersWithChanges = new Set()
    this.arrayHandlersWithChanges = new Set()
    this.lowHandlersWithChanges = new Set()

    this._pristine = {}
    this.proxy = {}

    this.lowPrio = {}   // low prio only supports merges
    this.merges = {}    // auto merge
    this.deletes = {}   // delete all
    this.replaces = {}  // replace instead of merge (objects/arrays only)
    this.meta = {}      // meta commands (mostly for arrays); the most basic (delete, merge, replace) are separate to conserve space
    this.dictionary = new FakeLongKeyDictionary()

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
}
