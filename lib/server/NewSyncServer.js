import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {clear, isEmpty, merge} from "@Lib/objUtil";
import {FakeLongKeyDictionary} from "@Lib/shared/FakeLongKeyDictionary";
import {KEYWORDS_FROM, KEYWORDS, INDICES} from "@Lib/shared/SYMBOLS";
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
    this.lowContainersCache = {}
    this.customMessageHandler = (message, client) => {}
  }

  set onmessage(value) {
    this.customMessageHandler = value
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
    const events = message[INDICES.events]
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
    const messages = message[INDICES.messages]
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
    const commands = message[INDICES.commands]
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

  // fixme: looks like it does not need to be here
  fullUpdate(client) {
    const message = {}
    this.bundleContainersFull(message)
    this.bundleDictionaryFull(message)
    this.driver.send(client, message)
  }

  bundleEvents(client, message) {
    if (this.global.events.length > 0 || client.events.length > 0) {
      message[INDICES.events] = this.global.events.concat(client.events)
      client.events = []
    }
  }

  bundleMessages(client, message) {
    if (this.global.messages.length > 0 || client.messages.length > 0) {
      message[INDICES.messages] = this.global.messages.concat(client.messages)
      client.messages = []
    }
  }

  bundleCommands(client, message) {
    if (this.global.commands.length > 0 || client.commands.length > 0) {
      message[INDICES.commands] = this.global.commands.concat(client.commands)
      client.commands = []
    }
  }

  bundleDictionaryFull(message) {
    message[INDICES.dictionary] = Object.fromEntries(this.dict.toMap.entries())
  }

  bundleDictionaryChanges(client, message) {
    if (isEmpty(this.dict.changes)) {return}
    message[INDICES.dictionary] = this.dict.changes
  }

  bundleContainersFull(message) {
    if (isEmpty(this.containers)) {return}
    message[INDICES.containers] = {}
    for (const k in this.containers) {
      message[INDICES.containers][this.dict.shorten(k)] = this.coder.pack(this.dict.shortenObject(this.containers[k].pristine))
    }
  }

  bundleContainersChanges(client, message) {
    let containersMessage = {};

    const {containers, dict} = this
    // If user has specified allContainers override, iterate through containers, else iterate through the user's
    // whitelist
    const iterateIn = client.allContainers ? Object.keys(containers) : client.whitelist
    for (let k of iterateIn) {
      const shortKey = dict.shorten(k)
      if (client.fullUpdate[k]) {
        containersMessage[shortKey] = this.getFullContainer(k)
        delete client.fullUpdate[k]
      }
      else {
        const changes = this.getContainerChanges(k)
        if (!isEmpty(changes)) {
          containersMessage[shortKey] = changes
        }
      }
    }
    if (!isEmpty(containersMessage)) {message[INDICES.containers] = containersMessage}
  }

  getContainerChanges(container) {
    const c = this.containers[container]
    if (this.containersCache[container] === undefined) {
      c.propagateChanges()
      const containerData = []
      if (!isEmpty(c.merges)) {containerData[INDICES.merges] = c.merges}
      if (!isEmpty(c.deletes)) {containerData[INDICES.deletes] = c.deletes}
      if (!this.driver.isLowPrioSupported() && !isEmpty(c.lowPrio)) {containerData[INDICES.merges] = merge(containerData[INDICES.merges], c.lowPrio)}
      if (!isEmpty(c.meta)) {containerData[INDICES.meta] = c.meta}
      if (!isEmpty(containerData)) {
        this.containersCache[container] = this.coder.pack(this.dict.shortenObject(containerData))
      }
      else {
        this.containersCache[container] = null
      }
    }
    return this.containersCache[container]
  }

  getLowPrioChangesMessage(client, message) {
    const msg = []
    msg[INDICES.containers] = {}

    const {containers, dict} = this
    const iterateIn = client.allContainers ? Object.keys(containers) : client.whitelist
    for (let k of iterateIn) {
      if (this.lowContainersCache[k] === undefined) {
        if (!isEmpty(this.containers[k].lowPrio)) {
          const shortKey = dict.shorten(k)
          const changes = this.containers[k].lowPrio
          const containerData = []
          containerData[INDICES.merges] = changes

          const packed = this.coder.pack(this.dict.shortenObject(containerData))
          msg[INDICES.containers][shortKey] = packed
          this.lowContainersCache[k] = packed
        }
        else {
          this.lowContainersCache[k] = null
        }
      }
      else if (this.lowContainersCache[k] !== null) {
        const shortKey = dict.shorten(k)
        msg[INDICES.containers][shortKey] = this.lowContainersCache[k]
      }
    }
    return msg;
  }

  getFullContainer(container) {
    const c = this.containers[container]
    if (!this.fullContainersCache[container]) {
      const containerData = {[INDICES.merges]: c.pristine}
      this.fullContainersCache[container] = this.coder.pack(this.dict.shortenObject(containerData))
    }
    return this.fullContainersCache[container]
  }

  sync() {
    const clientsKeys = Object.keys(this.clients)
    console.log('Syncing with', clientsKeys.length, 'client(s).');
    for (const c of clientsKeys) {
      const client = this.clients[c]
      const message = this.getChangesMessage(client)
      let lpMessage;

      // If we support low prio, generate a separate message for it
      // If we do not support low prio, the 'getChangesMessage' method automatically bundled the changes
      if (this.driver.isLowPrioSupported()) {
        lpMessage = this.getLowPrioChangesMessage(client)
        if (!isEmpty(lpMessage[INDICES.containers])) {
          this.driver.sendLowPrio(client, lpMessage)
        }
      }

      if (!isEmpty(message)) {
        this.driver.send(client, message)
      }
    }

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
    this.lowContainersCache = {}
  }

  clearFullContainerCache() {
    this.fullContainersCache = {}
  }

  getChangesMessage(client) {
    const message = []
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
    const message = {[INDICES.commands]: commands}
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
    const message = []
    message[INDICES.commands] = command
    this.send(client, message)
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
    const message = []
    message[INDICES.commands] = command
    this.sendAll(message)
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
    const _message = []
    _message[INDICES.messages] = message
    this.send(client, _message)
  }

  sendMessagesArray(client, messages) {
    const _message = []
    _message[INDICES.messages] = messages
    this.send(client, _message)
  }

  sendMessages(client, ...messages) {
    const _message = []
    _message[INDICES.messages] = messages
    this.send(client, _message)
  }

  sendMessageAll(message) {
    const _message = []
    _message[INDICES.messages] = message
    this.sendAll(_message)
  }

  sendMessagesArrayAll(messages) {
    const _message = []
    _message[INDICES.messages] = messages
    this.sendAll(_message)
  }

  sendMessagesAll(...messages) {
    const _message = []
    _message[INDICES.messages] = messages
    this.sendAll(_message)
  }

  sendEvent(client, eventName, ...args) {
    const _message = []
    _message[INDICES.events] = [eventName, ...args]
    this.send(client, _message)
  }

  sendEventsArray(client, events) {
    const _message = []
    _message[INDICES.events] = events
    this.send(client, _message)
  }

  sendEvents(client, ...events) {
    const _message = []
    _message[INDICES.events] = events
    this.send(client, _message)
  }

  sendEventAll(eventName, ...args) {
    const _message = []
    _message[INDICES.events] = [eventName, ...args]
    this.sendAll(_message)
  }

  sendEventsArrayAll(events) {
    const _message = []
    _message[INDICES.events] = events
    this.sendAll(_message)
  }

  sendEventsAll(...events) {
    const _message = []
    _message[INDICES.events] = events
    this.sendAll(_message)
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
