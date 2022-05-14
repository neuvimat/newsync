import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {clear, isEmpty, merge} from "@Lib/objUtil";
import {FakeLongKeyDictionary} from "@Lib/shared/FakeLongKeyDictionary";
import {KEYWORDS_FROM, KEYWORDS} from "@Lib/shared/SYMBOLS";
import {COMMANDS} from "@Lib/shared/COMMANDS";

export class NewSyncServer {
  static clientId = 1 // Fix issue with client id = 0 is falsy value

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

    this.global = {events: [], messages: [], commands: []}
    this.containersCache = {}
    this.fullContainersCache = {}
    this.customMessageHandler = (message, client) => {}
  }

  setCustomMessageHandler(fn) {
    this.customMessageHandler = fn
  }

  // Expects already extracted message (data = JS object), but not restored
  handleMessage(message, client) {
    console.log('got message', message, 'from client', client.id);
    this.handleCommands(message, client)
    this.handleEvents(message, client)
    this.handleUserMessages(message, client)
  }

  /**
   *
   * @param message
   * @param client {IClientModel}
   */
  handleEvents(message, client) {
    const events = message[KEYWORDS.events]
    if (!events) return;
    for (const e of events) {
      console.log('e', e);
      this.dispatchEvent(e[0], client, ...(e.slice(1)))
    }
  }

  /**
   *
   * @param message
   * @param client {IClientModel}
   */
  handleUserMessages(message, client) {
    const messages = message[KEYWORDS.messages]
    if (!messages) return;
    for (const m of messages) {
      this.customMessageHandler(m, client)
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
      //const c = commands[pointer]
      switch (commands[pointer]) {
        case COMMANDS.SUBSCRIBE_ALL:
          client.requestAllContainers(true, this.containers)
          break;
        case COMMANDS.UNSUBSCRIBE_ALL:
          client.requestAllContainers(false, this.containers)
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
          console.error(`Unknown command received from client! Error at index: ${pointer}! Cancelling further processing of commands!`)
          console.error(commands);
          pointer = commands.length
      }
      pointer++
      //console.log('Handled command:',c);
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

  removeClient(client) {
    if (client && client.id) {
      this.driver.removeClient(client.id)
      delete this.clients[client.id]
    }
  }

  fullUpdate(client) {
    const message = {}
    this.bundleContainersFull(message)
    this.bundleDictionaryFull(message)
    this.driver.send(client, message)
  }

  bundleEvents(client, message) {
    if (this.global.events.length > 0 || client.events.length > 0) {
      message[KEYWORDS.events] = this.global.events.concat(client.events)
      client.events = []
    }
  }

  bundleMessages(client, message) {
    if (this.global.messages.length > 0 || client.messages.length > 0) {
      message[KEYWORDS.messages] = this.global.messages.concat(client.messages)
      client.messages = []
    }
  }

  bundleCommands(client, message) {
    if (this.global.commands.length > 0 || client.commands.length > 0) {
      message[KEYWORDS.commands] = this.global.commands.concat(client.commands)
      client.commands = []
    }
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
    let wasChanged = false
    message[KEYWORDS.containers] = {}

    const {containers, dict} = this
    // If user has specified allContainers override, iterate through containers, else the user's whitelist
    const iterateIn = client.allContainers ? Object.keys(containers) : client.whitelist
    for (let k of iterateIn) {
      const shortKey = dict.shorten(k)
      if (client.fullUpdate[k]) {
        wasChanged = true
        message[KEYWORDS.containers][shortKey] = this.getFullContainer(k)
        delete client.fullUpdate[k]
      }
      else {
        const changes = this.getContainerChanges(k)
        if (!isEmpty(changes)) {
          wasChanged = true
          message[KEYWORDS.containers][shortKey] = changes
        }
      }
    }
    if (!wasChanged) {delete message[KEYWORDS.containers]}
  }

  getContainerChanges(container) {
    const c = this.containers[container]
    if (this.containersCache[container] === undefined) {
      c.propagateChanges()
      const containerData = {}
      if (!isEmpty(c.merges)) {containerData[KEYWORDS.merges] = c.merges}
      if (!isEmpty(c.deletes)) {containerData[KEYWORDS.deletes] = c.deletes}
      if (!isEmpty(c.meta)) {containerData[KEYWORDS.meta] = c.meta}
      if (!isEmpty(containerData)) {
        this.containersCache[container] = this.coder.pack(this.dict.shortenObject(containerData))
      }
      else {
        this.containersCache[container] = null
      }
    }
    return this.containersCache[container]
  }

  getFullContainer(container) {
    const c = this.containers[container]
    if (!this.fullContainersCache[container]) {
      const containerData = {[KEYWORDS.merges]: c.pristine}
      this.fullContainersCache[container] = this.coder.pack(this.dict.shortenObject(containerData))
    }
    return this.fullContainersCache[container]
  }

  includeGlobals() {}

  sync() {
    const clientsKeys = Object.keys(this.clients)
    console.log('Syncing with', clientsKeys.length, 'client(s).');
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
    this.clearFullContainerCache()
    this.clearGlobal()
  }

  clearGlobal() {
    this.global = {events: [], commands: [], messages: []}
  }

  clearContainerCache() {
    this.containersCache = {}
  }

  clearFullContainerCache() {
    this.fullContainersCache = {}
  }

  getChangesMessage(client) {
    const message = {}
    if (!isEmpty(this.containers)) {
      this.bundleContainersChanges(client, message)
    }
    if (!isEmpty(this.dict.changes)) {
      this.bundleDictionaryChanges(client, message)
    }
    this.bundleEvents(client, message)
    this.bundleMessages(client, message)
    this.bundleCommands(client, message)

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
    this.bundleDictionaryFull(message)
    this.driver.send(client, message)
  }

  send(client, message) {
    this.driver.send(client, message)
  }

  sendAll(message) {
    this.driver.sendToAll(message)
  }

  sendCommand(client, command) {
    this.send(client, {[KEYWORDS.commands]: command})
  }

  sendCommandsArray(client, commands) {
    const commandArray = []
    for (let c of commands) {
      for (let e of c) {
        commandArray.push(e)
      }
    }
    this.sendCommand(client, commandArray)
  }

  sendCommands(client, ...commands) {
    const commandArray = []
    for (let c of commands) {
      for (let e of c) {
        commandArray.push(e)
      }
    }
    this.sendCommand(client, commandArray)
  }

  sendCommandAll(command) {
    this.sendAll({[KEYWORDS.commands]: command})
  }

  sendCommandsArrayAll(commands) {
    const commandArray = []
    for (let c of commands) {
      for (let e of c) {
        commandArray.push(e)
      }
    }
    this.sendCommandAll(commandArray)
  }

  sendCommandsAll(...commands) {
    const commandArray = []
    for (let c of commands) {
      for (let e of c) {
        commandArray.push(e)
      }
    }
    this.sendCommandAll(commandArray)
  }

  sendMessage(client, message) {
    this.send(client, {[KEYWORDS.messages]: [message]})
  }

  sendMessagesArray(client, messages) {
    this.send(client, {[KEYWORDS.messages]: messages})
  }

  sendMessages(client, ...messages) {
    this.send(client, {[KEYWORDS.messages]: messages})
  }

  sendMessageAll(message) {
    this.sendAll({[KEYWORDS.messages]: [message]})
  }

  sendMessagesArrayAll(messages) {
    this.sendAll({[KEYWORDS.messages]: messages})
  }

  sendMessagesAll(...messages) {
    this.sendAll({[KEYWORDS.messages]: messages})
  }

  sendEvent(client, eventName, ...args) {
    this.send(client, {[KEYWORDS.events]: [eventName, ...args]})
  }

  sendEventsArray(client, events) {
    this.send(client, {[KEYWORDS.events]: events})
  }

  sendEvents(client, ...events) {
    this.send(client, {[KEYWORDS.events]: event})
  }

  sendEventAll(eventName, ...args) {
    this.sendAll({[KEYWORDS.events]: [eventName, ...args]})
  }

  sendEventsArrayAll(events) {
    this.sendAll({[KEYWORDS.events]: events})
  }

  sendEventsAll(...events) {
    this.sendAll({[KEYWORDS.events]: event})
  }

  scheduleCommand(client, command) {
    for (const c of command) {
      client.commands.push(c)
    }
  }

  scheduleMessage(client, message) {
    client.messages.push(message)
  }

  scheduleEvent(client, eventName, ...args) {
    client.events.push([eventName, ...args])
  }

  scheduleCommandAll(command) {
    for (const c of command) {
      this.global.commands.push(c)
    }
  }

  scheduleMessageAll(message) {
    this.global.messages.push(message)
  }

  scheduleEventAll(eventName, ...args) {
    this.global.events.push([eventName, ...args])
  }
}
