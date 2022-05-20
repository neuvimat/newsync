import {LongKeyDictionaryServer} from "@Lib/server/LongKeyDictionaryServer";
import {clear, isEmpty, merge} from "@Lib/util/objUtil";
import {FakeLongKeyDictionary} from "@Lib/shared/FakeLongKeyDictionary";
import {KEYWORDS_FROM, KEYWORDS, INDICES} from "@Lib/shared/SYMBOLS";
import {COMMANDS} from "@Lib/shared/COMMANDS";

/**
 * The server side version of NewSync framework. This is a facade that helps conceal the complexity between multiple
 * underlying components.
 */
export class NewSyncServer {
  static clientId = 1 // Fix issue with client id = 0 is falsy value

  /**
   *
   * @param driver {IDriverServer}
   * @param coder {ICoder}
   * @param dictionary {LongKeyDictionaryServer}
   */
  constructor(driver, coder, dictionary) {
    this.driver = driver
    this.dict = this.setUpDictionary(dictionary);
    this.coder = coder
    this.containers = {}
    this._interval = null
    this.clients = {}

    // Inject ourselves into driver and coder
    this.driver.newSync = this
    this.coder.newSync = this

    this.listeners = {}

    this.global = {events: [], messages: [], commands: []}
    this.containersCache = {}
    this.fullContainersCache = {}
    this.lowContainersCache = {}
    this.customMessageHandler = (message, client) => {}
  }

  /**
   * Set the handler that will be triggered whenever a custom message is received.
   * @param fn {function (client, message):void}
   */
  set onmessage(fn) {
    this.customMessageHandler = fn
  }

  /**
   * Set the handler that will be triggered whenever a custom message is received.
   * @param fn {function (client, message):void}
   */
  setCustomMessageHandler(fn) {
    this.customMessageHandler = fn
  }

  /**
   * Handles a message
   * @param message {object} received message
   * @param client {IClientModel} client that sent the message
   */
  handleMessage(message, client) {
    this.handleCommands(message, client)
    this.handleEvents(message, client)
    this.handleUserMessages(message, client)
  }

  /**
   *
   * @param message {object}
   * @param client {IClientModel}
   */
  handleEvents(message, client) {
    const events = message[INDICES.events]
    if (!events) return;
    for (const e of events) {
      this.dispatchEvent(e[0], client, ...(e.slice(1)))
    }
  }

  /**
   *
   * @param message {object}
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
   * @param message {object}
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

  /**
   * Attach a listener to the specified event
   * @param eventName {string}
   * @param listenerFn {function(string, ...*):void}
   */
  on(eventName, listenerFn) {
    this.addEventListener(eventName, listenerFn)
  }

  /**
   * Alias to {@link on}
   * @param eventName {string}
   * @param listenerFn {function(string, ...*):void}
   */
  addEventListener(eventName, listenerFn) {
    if (!this.listeners[eventName]) {this.listeners[eventName] = new Map()}
    this.listeners[eventName].set(listenerFn, listenerFn)
  }

  /**
   * Remove a listener for the specified event
   * @param eventName {string}
   * @param listenerFn {function(string, ...*):void}
   */
  removeEventListener(eventName, listenerFn) {
    if (!this.listeners[eventName]) {return}
    this.listeners[eventName].delete(listenerFn)
  }

  /**
   * Trigger all listeners to the specified event
   * @param eventName {string}
   * @param args {...*}
   */
  dispatchEvent(eventName, ...args) {
    if (!this.listeners[eventName]) {return}
    for (let listener of this.listeners[eventName].keys()) {
      listener(...args)
    }
  }

  /**
   * If no dictionary is specified, automatically create a fake dictionary that does nothing (i.e. do not use dictionary)
   * @param dictionary {LongKeyDictionaryServer|false|undefined}
   * @return {LongKeyDictionaryServer|FakeLongKeyDictionary|*}
   */
  _setUpDictionary(dictionary) {
    if (dictionary === undefined || dictionary === true) {
      return new LongKeyDictionaryServer()
    }
    else if (dictionary === false) {
      return new FakeLongKeyDictionary()
    }
    return dictionary
  }

  /**
   * Identify whether specified data is a NewSync synchronization message
   * @param data {*}
   * @return {boolean}
   */
  isFrameworkMessage(data) {
    return this.driver.isFrameworkMessage(data)
  }

  /**
   * Handle the message if it is a NewSync synchronization message and return true. If it is not, return false and do
   * nothing else.
   * @param data {*}
   * @param client {IClientModel}
   * @return {boolean}
   */
  handleIfFrameworkMessage(data, client) {
    const extracted = this.driver.extractMessage(data)
    if (extracted !== false) {
      this.handleMessage(extracted, client)
      return true
    }
    return false
  }

  /**
   * Add a new client connection to the NewSync pipeline. To know what arguments to pass, have a look at the
   * specification driver 'createClientObject' method! Note that the id parameter is autofilled by this method. The
   * rest of the parameters need to be supplied by the programmer!
   * @param args {...*}
   * @return {IClientModel}
   */
  addClient(...args) {
    const id = NewSyncServer.clientId++
    this.clients[id] = this.driver.createClientObject(id, ...args)
    this.welcome(this.clients[id])
    return this.clients[id]
  }

  /**
   * Remove the specified client by their handle
   * @param client {IClientModel}
   */
  removeClient(client) {
    if (client && client.id) {
      this.driver.removeClient(client.id)
      delete this.clients[client.id]
    }
  }

  /**
   * Attach events for the specific client's message
   * @param client {IClientModel}
   * @param message {object}
   */
  bundleEvents(client, message) {
    if (this.global.events.length > 0 || client.events.length > 0) {
      message[INDICES.events] = this.global.events.concat(client.events)
      client.events = []
    }
  }

  /**
   * Attach messages (the user messages) for the specific client's message
   * @param client {IClientModel}
   * @param message {object}
   */
  bundleMessages(client, message) {
    if (this.global.messages.length > 0 || client.messages.length > 0) {
      message[INDICES.messages] = this.global.messages.concat(client.messages)
      client.messages = []
    }
  }

  /**
   * Attach commands for the specific client's message
   * @param client {IClientModel}
   * @param message {object}
   */
  bundleCommands(client, message) {
    if (this.global.commands.length > 0 || client.commands.length > 0) {
      message[INDICES.commands] = this.global.commands.concat(client.commands)
      client.commands = []
    }
  }

  /**
   * Attach the full dictionary to the specific message
   * @param message {object}
   */
  bundleDictionaryFull(message) {
    message[INDICES.dictionary] = Object.fromEntries(this.dict.toMap.entries())
  }

  /**
   * Attach the changes to the dictionary to the specific message
   * @param client {IClientModel}
   * @param message {object}
   */
  bundleDictionaryChanges(client, message) {
    if (isEmpty(this.dict.changes)) {return}
    message[INDICES.dictionary] = this.dict.changes
  }

  /**
   * Attach container changes to the message of specified client
   * @param client {IClientModel}
   * @param message {*}
   */
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

  /**
   * Retrieve the changes withing the specified container
   * @param container {string} key under which the container is stored inside the NewSync
   * @return {*}
   */
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

  /**
   * Attach low priortiy container changes to the message of specified client
   * @param client {IClientModel}
   */
  getLowPrioChangesMessage(client) {
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

  /**
   * Get full data of the container specified by key
   * @param container {string} key under which the container is stored inside the NewSync
   * @return {*}
   */
  getFullContainer(container) {
    const c = this.containers[container]
    if (!this.fullContainersCache[container]) {
      const containerData = {[INDICES.merges]: c.pristine}
      this.fullContainersCache[container] = this.coder.pack(this.dict.shortenObject(containerData))
    }
    return this.fullContainersCache[container]
  }

  /**
   * Trigger synchronization cycle
   */
  sync() {
    const clientsKeys = Object.keys(this.clients)
    console.log('Syncing with', clientsKeys.length, 'client(s).');
    for (const c of clientsKeys) {
      const client = this.clients[c]
      const message = this.getSynchronizationMessage(client)
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

  /**
   * Clear commands, events and messages queued for broadcast
   */
  clearGlobal() {
    this.global = {events: [], commands: [], messages: []}
  }

  /**
   * Clear the cached container data
   */
  clearContainerCache() {
    this.containersCache = {}
    this.lowContainersCache = {}
  }

  /**
   * Clear the cached full container data
   */
  clearFullContainerCache() {
    this.fullContainersCache = {}
  }

  /**
   * Get the full synchronization message tailored fot the specified client
   * @param client {IClientModel}
   * @return {[]}
   */
  getSynchronizationMessage(client) {
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

  /**
   * Turn on automatic periodical synchronization done every X ms
   * @param period {number} milliseconds
   */
  enableAutoSync(period = 1000) {
    if (this._interval === null) {
      setInterval(() => {
        this.sync()
      }, interval)
    }
  }

  /**
   * Disables the running automatic synchronization
   */
  disableAutoSync() {
    if (this._interval !== null) {
      clearInterval(this._interval)
      this._interval = null
    }
  }

  /**
   * Add an instance of a container under the specified id
   * @param id {string}
   * @param container {IContainer}
   * @return {*}
   */
  addContainer(id, container) {
    container.newSync = this
    container.dict = this.dict
    container.init()
    this.containers[id] = container
    return container
  }

  /**
   * Send a 'welcome' message to newly connected client. The message contains all currently existing containers and full
   * state of the dictionary
   * @param client {IClientModel}
   */
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

  /**
   * Send the specified message (an JS object; and NOT a user message as in user event or user message) to the client
   * @param client {IClientModel}
   * @param message {*}
   */
  send(client, message) {
    this.driver.send(client, message)
  }

  /**
   * Send the specified message (an JS object; and NOT a user message as in user event or user message) to all currently connected clients.
   * @param message {*}
   */
  sendAll(message) {
    this.driver.sendToAll(message)
  }

  /**
   * Immediately send a command to the specified user
   * @param client {IClientModel}
   * @param command {NewSyncCommand}
   */
  sendCommand(client, command) {
    const message = []
    message[INDICES.commands] = command
    this.send(client, message)
  }

  /**
   * Immediately send multiple commands represented as an array to the specified user
   * @param client {IClientModel}
   * @param commands {NewSyncCommand[]}
   */
  sendCommandsArray(client, commands) {
    const commandArray = []
    for (let c of commands) {
      for (let e of c) {
        commandArray.push(e)
      }
    }
    this.sendCommand(client, commandArray)
  }

  /**
   * Immediately send multiple commands represented as an array to the specified user
   * @param client {IClientModel}
   * @param commands {...NewSyncCommand}
   */
  sendCommands(client, ...commands) {
    const commandArray = []
    for (let c of commands) {
      for (let e of c) {
        commandArray.push(e)
      }
    }
    this.sendCommand(client, commandArray)
  }

  /**
   * Send a command to all users
   * @param command {NewSyncCommand}
   */
  sendCommandAll(command) {
    const message = []
    message[INDICES.commands] = command
    this.sendAll(message)
  }

  /**
   * Send an array of commands to all users
   * @param commands {NewSyncCommand}
   */
  sendCommandsArrayAll(commands) {
    const commandArray = []
    for (let c of commands) {
      for (let e of c) {
        commandArray.push(e)
      }
    }
    this.sendCommandAll(commandArray)
  }

  /**
   * Send commands to all users
   * @param commands {NewSyncCommand}
   */
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
    _message[INDICES.messages] = [message]
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
    _message[INDICES.messages] = [message]
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
    _message[INDICES.events] = [[eventName, ...args]]
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
    _message[INDICES.events] = [[eventName, ...args]]
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
