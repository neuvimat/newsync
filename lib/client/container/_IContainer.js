/**
 * @interface
 */
import {clear as _clear, isEmpty} from "@Lib/objUtil";

export class IContainer {
  newSync // gets auto-injected

  /** @type {NewSyncServer} */
  constructor() {
    this.pristine = null
    this.proxy = null
    this.changes = null
    this.incrementalChanges = null
    this.lowPrioChanges = null
    this.version = 0
  }

  toJSON() {
    return {...this.pristine}
  }

  clear() {
    if (!isEmpty(this.changes) || !isEmpty(this.lowPrioChanges) || !isEmpty(this.incrementalChanges)) this.version++
    _clear(this.changes)
    _clear(this.lowPrioChanges)
    _clear(this.incrementalChanges)
  }
}
