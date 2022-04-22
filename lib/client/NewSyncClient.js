// noinspection DuplicatedCode

import {clear, isEmpty, merge} from "@Lib/objUtil";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {KEYWORDS_FROM, KEYWORDS} from "@Lib/shared/SYMBOLS";

export class NewSyncClient extends NewSyncServer {
  client = null // this is the actual connection to the server, so it might be a bit misleading, perhaps peer would be better?
  constructor(driver, coder, dictionary) {
    super(driver, coder, dictionary);
  }

  install(...args) {
    this.driver.install(...args)
  }

  handleMessage(message) {
    let containers = {}
    if (isEmpty(message)) {return} // should be unnecessary, as we should not ever send or receive en empty message

    const dictUpdate = message[KEYWORDS.dictionary]
    if (dictUpdate) {
      this.dict.updateShorts(dictUpdate)
    }
    const rawContainers = message[KEYWORDS.containers]
    if (rawContainers) {
      for (const c in rawContainers) {
        rawContainers[c] = this.coder.unpack(rawContainers[c])
      }
      containers = this.dict.restoreObject(rawContainers)
      for (let k in containers) {
        if (this.containers[k] === undefined) {
          this.addContainer(k, new SimpleContainer())
        }
        merge(this.containers[k].pristine, containers[k])
      }
    }
    this.dispatchEvent('sync', {state: this.containers, message: message, containers: containers, rawContainers: rawContainers})
  }

  fullUpdate(client) {

  }

  sync() {

  }

  setConnection(...args) {
    this.client = this.driver.createClientObject(0, ...args);
    return this.client
  }

  send(message) {
    this.driver.send(this.client, message)
  }

  isReady() {
    return !!this.client
  }
}
