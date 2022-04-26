import {EntityProxyHandler} from "@Lib/shared/proxies/EntityProxyHandler";
import {FakeLongKeyDictionary} from "@Lib/shared/FakeLongKeyDictionary";

import {SYMBOLS} from "@Lib/shared/SYMBOLS";
import {clear} from "@Lib/objUtil";

const {sProxy, sContainer, sLevel, sPristine} = SYMBOLS

export class EntityContainer {
  constructor() {
    this.handlersWithChanges = new Set()

    this._pristine = {}
    this.proxy = {}
    this.merges = {}
    this.deletes = {}
    this.meta = {}
    this.dictionary = new FakeLongKeyDictionary()

    this.proxy = new Proxy(this._pristine, new EntityProxyHandler(this, null, null, this._pristine))
    this._pristine[sProxy] = this.proxy
  }

  set pristine(value) {
    this._pristine = {}
    this.proxy = new Proxy(this._pristine, new EntityProxyHandler(this, []))
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
    clear(this.merges)
    clear(this.deletes)
    clear(this.meta)
    for (const h of this.handlersWithChanges) {
      h.propagateChanges()
    }
    this.handlersWithChanges.clear()
  }
}
