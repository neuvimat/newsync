// noinspection DuplicatedCode

import {clear, isEmpty, merge} from "@Lib/objUtil";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {KEYWORDS_FROM, KEYWORDS} from "@Lib/shared/SYMBOLS";

export class NewSyncClient extends NewSyncServer {
  client = null
  constructor(driver, coder, dictionary) {
    super(driver, coder, dictionary);
  }

  install(...args) {
    this.driver.install(...args)
  }

  handleMessage(message) {
    let containers
    if (isEmpty(message)) {return} // should be unnecessary, as we should not ever send or receive en empty message

    const dictUpdate = message[this.dict.getShort('dictionary')]
    if (dictUpdate) {
      this.dict.updateShorts(dictUpdate)
    }
    const rawContainers = message[this.dict.getShort('containers')]
    if (rawContainers) {
      containers = this.dict.restoreObject(rawContainers)
      for (let k in containers) {
        if (this.containers[k] === undefined) {
          this.addContainer(k, new SimpleContainer())
        }
        merge(this.containers[k].pristine, containers[k])
      }
    }
    if (message[this.dict.getShort('lowPrio')]) {
      this.dispatchEvent('syncLowPrio', {message})
    }
    else {
      this.dispatchEvent('sync', {state: this.containers, changes: containers})
    }
  }

  fullUpdate(client) {

  }

  sync() {

  }

  autosync(enable) {
    this.driver.send(this.client, {[KEYWORDS.commands]: [enable ? 0 : 1]});
  }

  setConnection(...args) {
    this.client = this.driver.createClientObject(0, ...args);
    return this.client
  }

  isReady() {
    return !!this.client
  }
}
