import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {clear, isEmpty, merge} from "@Lib/objUtil";
import {FakeLongKeyDictionary} from "@Lib/shared/FakeLongKeyDictionary";
import {KEYWORDS_FROM, KEYWORDS} from "@Lib/shared/SYMBOLS";
import {COMMANDS} from "@Lib/shared/COMMANDS";

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

    this.listeners = {}

    this.global = {events: [], messages: [], meta: [], commands: []}
    this.containersCache = {}
    this.customMessageHandler = (message)=>{}
  }

  setCustomMessageHandler(fn) {
    this.customMessageHandler = fn
  }

  // Expects already extracted message (data = JS object), but not restored
  handleMessage(message, client) {
    this.handleCommands(message, client)
    this.handleEvents(message, client)
    this.handleMessages(message, client)
  }

  /**
   *
   * @param message
   * @param client {IClientModel}
   */
  handleEvents(message,client) {
    const events = message[KEYWORDS.events]
    if (!events) return;
    for (const e of events) {
      console.log('raw event', e);
      console.log('e.slice(1)', e.slice(1));
      console.log('...e.slice(1)', ...e.slice(1));
      this.dispatchEvent(e[0], ...e.slice(1))
    }
  }

  /**
   *
   * @param message
   * @param client {IClientModel}
   */
  handleMessages(message, client) {
    const messages = message[KEYWORDS.messages]
    if (!messages) return;
    for (const m of messages) {
      this.customMessageHandler(m)
    }
  }

  /**
   *
   * @param message
   * @param client {IClientModel}
   */
  handleCommands(message, client) {
    const commands = message[KEYWORDS.commands]
    if (!commands) return;
    let pointer = 0
    while (pointer < commands.length) {
      switch (commands[pointer]) {
        case COMMANDS.SUBSCRIBE_ALL:
          console.log('should get all');
          client.requestAllContainers(true)
          break;
        case COMMANDS.UNSUBSCRIBE_ALL:
          client.requestAllContainers(false)
          break;
        case COMMANDS.SUBSCRIBE_CONTAINER:
          client.whitelistContainer(commands[++pointer])
          break;
        case COMMANDS.UNSUBSCRIBE_CONTAINER:
          client.blacklistContainer(commands[++pointer])
          break;
        case COMMANDS.SUBSCRIBE_CONTAINERS:
          for (const c of commands[++pointer]) {
            client.whitelistContainer(c)
          }
          break;
        case COMMANDS.UNSUBSCRIBE_CONTAINERS:
          for (const c of commands[++pointer]) {
            client.blacklistContainer(c)
          }
          break;
        default:
          console.error('Unknown command received from client! Cancelling further processing of commands!')
          pointer = commands.length
      }
      pointer++
    }
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
  dispatchEvent(eventName, ...args) {
    if (!this.listeners[eventName]) {return}
    for (let listener of this.listeners[eventName].keys()) {
      listener(...args)
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

  handleIfFrameworkMessage(data, client) {
    const extracted = this.driver.extractMessage(data)
    if (extracted !== false) {
      this.handleMessage(extracted, client)
      return true
    }
    return false
  }

  addClient(...args) {
    const id = NewSyncServer.clientId++
    this.clients[id] = this.driver.createClientObject(id, ...args)
    this.welcome(this.clients[id])
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
    this.driver.send(client, message)
  }

  bundleDictionaryFull(message) {
    message[KEYWORDS.dictionary] = Object.fromEntries(this.dict.toMap.entries())
  }

  bundleDictionaryChanges(client, message) {
    if (isEmpty(this.dict.changes)) {return}
    message[KEYWORDS.dictionary] = this.dict.changes
  }

  bundleContainersFull(message) {
    if (isEmpty(this.containers)) {return}
    message[KEYWORDS.containers] = {}
    for (const k in this.containers) {
      message[KEYWORDS.containers][this.dict.shorten(k)] = this.coder.pack(this.dict.shortenObject(this.containers[k].pristine))
    }
  }

  bundleContainersChanges(client, message) {
    message[KEYWORDS.containers] = {}
    let wasChanged = false
    const iterateIn = client.allContainers ? this.containers : client.whitelist
    for (let k in iterateIn) {
      const shortKey = this.dict.shorten(k)
      if (isEmpty(this.containers[k].changes)) {continue}
      wasChanged = true
      message[KEYWORDS.containers][shortKey] = this.getContainerChanges(k)
    }
    if (!wasChanged) {delete message[KEYWORDS.containers]}
  }

  getContainerChanges(container) {
    // if (!this.containers[container]) {console.error('Trying to get non existing container! ', container); return null;}
    if (!this.containersCache[container]) {
      this.containersCache[container] = this.coder.pack(this.dict.shortenObject(this.containers[container].changes))
    }
    return this.containersCache[container]
  }

  includeGlobals() {}

  sync() {
    const clientsKeys = Object.keys(this.clients)
    console.log('Syncing with',clientsKeys.length,'client(s).');
    for (const c of clientsKeys) {
      const client = this.clients[c]
      const message = this.getChangesMessage(client)
      // const lowPrioMessage = this.getLowPrioChangesMessage(client)
      if (!isEmpty(message)) {
        this.driver.send(client, message)
      }
    }

    // if (this.driver.isLowPrioSupported() && !isEmpty(lowPrioMessage)) {
    //   if (!isEmpty(changesMessage)) {
    //     this.driver.sendToAll(changesMessage)
    //   }
    //   if (!isEmpty(lowPrioMessage)) {
    //     this.driver.sendToAllLowPrio(lowPrioMessage)
    //   }
    // }
    // else {
    //   merge(changesMessage, lowPrioMessage)
    //   if (!isEmpty(changesMessage)) {
    //     this.driver.sendToAll(changesMessage)
    //   }
    // }

    // If there is nothing in this.getChangesMessage(), the changes should not ever need clearing, but better safe
    // than sorry; If it's really empty, then the additional clear is inconsequential performance-wise
    for (let k in this.containers) {
      this.containers[k].clear()
    }
    clear(this.dict.changes)
    this.clearContainerCache()
  }

  clearContainerCache() {
    this.containersCache = {}
  }

  getChangesMessage(client) {
    const message = {}
    if (!isEmpty(this.containers)) {
      this.bundleContainersChanges(client, message)
    }
    if (!isEmpty(this.dict.changes)) {
      this.bundleDictionaryChanges(client, message)
    }
    return message
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

  welcome(client) {
    const containers = []
    for (const c in this.containers) {
      containers.push(c)
    }
    const commands = [COMMANDS.NEW_CONTAINERS, containers]
    const message = {[KEYWORDS.commands]: commands}
    this.driver.send(client, message)
  }
}
