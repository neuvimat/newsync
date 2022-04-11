import {makeSimpleRecursiveProxy} from "../shared/SimpleProxy";
import {SYMBOL} from "@Lib/shared/SYMBOL";
import {LongKeyDictionary} from "@Lib/shared/LongKeyDictionary";
import {clear, merge} from "@Lib/objUtil";

export class NewSyncServer {
  static clientId = 0
  static dictionary

  get _d() {return NewSyncServer.dictionary}

  constructor(driver, coder) {
    NewSyncServer.dictionary = new LongKeyDictionary()
    this.driver = driver
    this.coder = coder
    this.containers = {}
    this._interval = null
    this.clients = {}

    this.driver.newSync = this
    this.coder.newSync = this
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
    if (this.driver.isFrameworkMessage(data)) {
      this.handleMessage(data)
      return true
    }
    return false
  }

  handleMessage(data) {
    // do handling
  }

  addClient(...args) {
    const id = NewSyncServer.clientId++
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
    this.containers[id] = container
    return container
  }
}
