/**
 * @interface
 */
export class IContainer {
  /** @type {NewSyncServer} */
  constructor(newSync) {
    this.newSync = newSync
    this.pristine = null
    this.proxy = null
    this.changes = null
  }

  toJSON() {
    return {...this.pristine}
  }
}
