import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {clear, isEmpty, merge} from "@Lib/objUtil";
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
    this.subscribers = {}

    this.driver.newSync = this
    this.coder.newSync = this

    this.listeners = {}
  }

  // Expects already extracted message (data = JS object), but not restored
  handleMessage(message) {

  }

  handleMessageExtracted(data) {

  }

  on(eventName, listenerFn) {
    this.addEventListener(eventName, listenerFn)
  }
  addEventListener(eventName, listenerFn) {
    if (!this.listeners[eventName]) {this.listeners[eventName] = new Map()}
    this.listeners[eventName].set(listenerFn, listenerFn)
  }
  removeEventListener(eventName, listenerFn) {
    if (!this.listeners[eventName]) {return}
    this.listeners[eventName].delete(listenerFn)
  }
  dispatchEvent(eventName, eventObject) {
    if (!this.listeners[eventName]) {return}
    for (let listener of this.listeners[eventName].keys()) {
      listener(eventObject)
    }
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

  subscribe(client) {

  }

  unsubscribe(client) {

  }

  addClient(...args) {
    const id = NewSyncServer.clientId++
    this.clients[id] = this.driver.createClientObject(id, ...args)
    return this.clients[id]
  }

  removeClient(id) {
    this.driver.removeClient(id)
    delete this.clients[id]
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
    if (Object.keys(this.dict.changes).length === 0) {return}
    message[shortKey] = this.dict.changes
  }

  bundleContainersFull(message) {
    const keys = Object.keys(this.containers);
    if (keys.length === 0) { return }

    const shortKey = this.dict.shorten('containers')
    message[shortKey] = {}
    for (let k of keys) {
      message[shortKey][this.dict.shorten(k)] = this.dict.shortenObject(this.containers[k].pristine)
    }
  }

  bundleContainersChanges(message) {
    const keys = Object.keys(this.containers);
    if (keys.length === 0) { return }
    let wasChanged = false

    const shortKey = this.dict.shorten('containers')
    message[shortKey] = {}
    for (let k of keys) {
      if (Object.keys(this.containers[k].changes).length === 0) {continue}
      wasChanged = true
      message[shortKey][this.dict.shorten(k)] = this.dict.shortenObject(this.containers[k].changes)
    }
    if (!wasChanged) {delete message[shortKey]}
  }

  sync() {
    const changesMessage = this.getChangesMessage()
    const lowPrioMessage = this.getLowPrioChangesMessage()

    if (this.driver.isLowPrioSupported() && !isEmpty(lowPrioMessage)) {
      if (!isEmpty(changesMessage)) {
        this.driver.sendToAll(changesMessage)
      }
      if (!isEmpty(lowPrioMessage)) {
        this.driver.sendToAllLowPrio(lowPrioMessage)
      }
    }
    else {
      merge(changesMessage, lowPrioMessage)
      if (!isEmpty(changesMessage)) {
        this.driver.sendToAll(changesMessage)
      }
    }

    console.log('SYnc for', Object.keys(this.clients).length, 'clients');

    // If there is nothing in this.getChangesMessage(), the changes should not ever need clearing, but better safe
    // than sorry; If it's really empty, then the additional clear is inconsequential performance-wise
    for (let k in this.containers) {
      this.containers[k].clear()
    }
    clear(this.dict.changes)
  }

  getChangesMessage() {
    const msg = {}
    this.bundleContainersChanges(msg)
    this.bundleDictionaryChanges(msg)
    return msg
  }

  getLowPrioChangesMessage() {
    const message = {}
    const keys = Object.keys(this.containers);
    if (keys.length === 0) { return {} }
    let wasChanged = false

    const shortKey = this.dict.shorten('containers')
    message[shortKey] = {}
    for (let k of keys) {
      if (Object.keys(this.containers[k].lowPrioChanges).length === 0) {continue}
      wasChanged = true
      message[shortKey][this.dict.shorten(k)] = this.dict.shortenObject(this.containers[k].lowPrioChanges)
    }
    if (!wasChanged) {delete message[shortKey]}
    return message
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
