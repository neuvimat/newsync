import {makeSimpleRecursiveProxy} from "../../shared/SimpleProxy";
import {merge} from "../../objUtil";
import {IContainer} from "./_IContainer";

export class SimpleContainer extends IContainer {
  constructor() {
    super();
    const {pristine, proxy, changes} = makeSimpleRecursiveProxy()

    this.pristine = pristine
    this.proxy = proxy
    this.changes = changes
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
