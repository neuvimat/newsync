// noinspection DuplicatedCode

import {clear, merge} from "@Lib/objUtil";
import {LongKeyDictionaryClient} from "@Lib/shared/LongKeyDictionaryClient";
import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {FakeLongKeyDictionary} from "@Lib/shared/FakeLongKeyDictionary";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";

export class NewSyncClient extends EventTarget {
  static clientId = 0

  constructor(driver, coder, dictionary) {
    super();
    this.dict = this.setUpDictionary(dictionary);
    this.driver = driver
    this.coder = coder
    this.containers = {}
    this._interval = null
    this.clients = {}

    this.driver.newSync = this
    this.coder.newSync = this
  }

  setUpDictionary(dictionary) {
    if (dictionary === undefined || dictionary === true) {
      return new LongKeyDictionaryServer()
    }
    else if (dictionary === false) {
      return new FakeLongKeyDictionary()
    }
    return dictionary
  }

  install() {
    if (this.driver) {
      this.driver.install()
    }
  }

  isFrameworkMessage(data) {
    return this.driver.isFrameworkMessage(data)
  }

  handleIfFrameworkMessage(data) {
    const extracted = this.driver.extractMessage(data)
    if (extracted !== false) {
      this.handleMessage(extracted)
      return true
    }
    return false
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

  addClient(...args) {
    const id = NewSyncClient.clientId++
    this.clients[id] = this.driver.createClientObject(id, ...args)
    return this.clients[id]
  }

  removeClient(id) {
    this.driver.removeClient(id)
  }

  fullUpdate(client) {
    const message = {}
    this.bundleContainersFull(message)
    this.bundleDictionaryFull(message)
    this.driver.send(message, client)
  }

  bundleDictionaryFull(message) {
    const key = this._d.shorten('dictionary')
    message[key] = this._d.container.pristine
  }

  bundleDictionaryChanges(message) {
    const shortKey = this._d.shorten('dictionary')
    message[shortKey] = this._d.container.changes
  }

  bundleContainersFull(message) {
    const keys = Object.keys(this.containers);
    const shortKey = this._d.shorten('containers')
    if (keys.length > 0) {
      message[shortKey] = {}
    }
    for (let k of keys) {
      message[shortKey][this._d.shorten(k)] = this._d.shortenObject(this.containers[k].pristine)
    }
  }

  bundleContainersChanges(message) {
    const keys = Object.keys(this.containers);
    const shortKey = this._d.shorten('containers')
    if (keys.length === 0) return {}
    message[shortKey] = {}
    for (let k of keys) {
      message[shortKey][this._d.shorten(k)] = this.containers[k].changes
    }
  }

  sync() {
    const object = this.getChangesMessage()
    this.driver.sendToAll(object)
    for (let k in this.containers) {
      clear(this.containers[k].changes)
    }
    clear(this._d.container.changes)
  }

  getChangesMessage() {
    const msg = {}
    this.bundleContainersChanges(msg)
    this.bundleDictionaryChanges(msg)
    return msg
  }

  enableAutoSync(interval = 1000) {
    if (this._interval === null) {
      setInterval(() => {
        this.sync()
      }, interval)
    }
  }

  disableAutoSync() {
    if (this._interval !== null) {
      clearInterval(this._interval)
      this._interval = null
    }
  }

  addContainer(id, container) {
    container.newSync = this
    container.dict = this.dict
    container.init()
    this.containers[id] = container
    return container
  }
}
