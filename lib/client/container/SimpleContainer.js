import {makeSimpleRecursiveProxy} from "@Lib/shared/SimpleProxy";
import {merge} from "@Lib/objUtil";
import {IContainer} from "./_IContainer";

export class SimpleContainer extends IContainer {
  newSync
  dictionary
  constructor(newSync) {
    super(newSync);
    this.newSync = newSync

    this.pristine = null
    this.proxy = null
    this.changes = null
    this.lowPrioChanges = null
    this.incrementalChanges = null
  }

  init() {
    const dictionary = this.newSync ? this.newSync.dict : undefined
    const {pristine, proxy, changes, lowPrioChanges, incrementalChanges} = makeSimpleRecursiveProxy(this.newSync.dict, this)
    this.pristine = pristine
    this.proxy = proxy
    this.changes = changes
    this.lowPrioChanges = lowPrioChanges
    this.incrementalChanges = incrementalChanges
  }

  acceptMessage(changes) {
    merge(this.pristine, changes)
  }

  acceptChanges(changes) {
    merge(this.pristine, changes)
  }

  getChanges() {
    return this.changes
  }
}
