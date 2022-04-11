import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {clear, merge} from "@Lib/objUtil";
import {FakeLongKeyDictionary} from "@Lib/shared/FakeLongKeyDictionary";

export class NewSyncServer {
  static clientId = 0

  constructor(driver, coder, dictionary) {
    this.driver = driver
    this.dict = this.setUpDictionary(dictionary);
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
    const key = this.dict.shorten('dictionary')
    message[key] = Object.fromEntries(this.dict.toMap.entries())
  }

  bundleDictionaryChanges(message) {
    const shortKey = this.dict.shorten('dictionary')
    message[shortKey] = this.dict.changes
  }

  bundleContainersFull(message) {
    const keys = Object.keys(this.containers);
    if (keys.length === 0) {
      return
    }

    const shortKey = this.dict.shorten('containers')
    message[shortKey] = {}
    for (let k of keys) {
      message[shortKey][this.dict.shorten(k)] = this.dict.shortenObject(this.containers[k].pristine)
    }
  }

  bundleContainersChanges(message) {
    const keys = Object.keys(this.containers);
    if (keys.length === 0) {
      return
    }

    const shortKey = this.dict.shorten('containers')
    message[shortKey] = {}
    for (let k of keys) {
      message[shortKey][this.dict.shorten(k)] = this.containers[k].changes
    }
  }

  sync() {
    const object = this.getChangesMessage()
    this.driver.sendToAll(object)
    for (let k in this.containers) {
      clear(this.containers[k].changes)
    }
    clear(this.dict.changes)
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
