// noinspection DuplicatedCode

import {clear, merge} from "@Lib/objUtil";
import {LongKeyDictionaryClient} from "@Lib/shared/LongKeyDictionaryClient";
import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {FakeLongKeyDictionary} from "@Lib/shared/FakeLongKeyDictionary";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {NewSyncServer} from "@Lib/server/NewSyncServer";

export class NewSyncClient extends NewSyncServer {
  constructor(driver, coder, dictionary) {
    super(driver, coder, dictionary);
  }

  handleMessage(data) {
    let containers;
    const dictUpdate = data[this.dict.getShort('dictionary')]
    if (dictUpdate) {
      this.dict.updateShorts(dictUpdate)
    }
    const containerChanges = data[this.dict.getShort('containers')]
    if (containerChanges) {
      containers =  this.dict.restoreObject(containerChanges)
      for (let k in containers) {
        if (this.containers[k] === undefined) {
          this.addContainer(k, new SimpleContainer())
        }
        merge(this.containers[k].pristine, containers[k])
      }
    }
    const event = new Event('sync')
    event.state = this.containers
    event.changes = containerChanges
    this.dispatchEvent(event)
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
