import {makeRecursiveProxy} from "../../proxymaker";
import {merge} from "../../objUtil";

export class SimpleContainer {
  constructor() {
    const {pristine, proxy, changes} = makeRecursiveProxy()

    this.pristine = pristine
    this.proxy = proxy
    this.changes = changes
  }

  acceptExternalChanges(changes) {
    merge(this.pristine, changes)
  }

  getChanges() {
    return this.changes
  }
}
