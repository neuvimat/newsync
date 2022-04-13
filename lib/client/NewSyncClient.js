// noinspection DuplicatedCode

import {clear, isEmpty, merge} from "@Lib/objUtil";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";

export class NewSyncClient extends NewSyncServer {
  constructor(driver, coder, dictionary) {
    super(driver, coder, dictionary);
  }

  install(...args) {
    this.driver.install(...args)
  }

  handleMessage(message) {
    let containers
    if (isEmpty(message)) {return}

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
    this.dispatchEvent('sync', {state: this.containers, changes: containers})
  }

  fullUpdate(client) {
    // todo: change to client version
    const message = {}
    this.bundleContainersFull(message)
    this.bundleDictionaryFull(message)
    this.driver.send(message, client)
  }

  sync() {
    // todo: change to client version
    const object = this.getChangesMessage()
    if (Object.keys(object).length > 0) {
      this.driver.sendToAll(object)
    }
    // If there is nothing in this.getChangesMessage(), the changes should not ever need clearing, but better safe
    // than sorry; If it's really empty, then the additional clear is inconsequential performance-wise
    for (let k in this.containers) {
      clear(this.containers[k].changes)
    }
    clear(this.dict.changes)
  }
}
