// noinspection DuplicatedCode
import {COMMANDS} from "@Lib/shared/COMMANDS";

import {applyDeletes, applyMeta, clear, isEmpty, merge} from "@Lib/objUtil";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {INDICES} from "@Lib/shared/SYMBOLS";
import {ALIAS} from "@Lib/shared/ALIAS";
import {ObjectContainer} from "@Lib/shared/container/ObjectContainer";

export class NewSyncClient extends NewSyncServer {
  client = null // this is the actual connection to the server, so it might be a bit misleading, perhaps peer would be
                // better?
  constructor(driver, coder, dictionary) {
    super(driver, coder, dictionary);
  }

  install(...args) {
    this.driver.install(...args)
  }

  handleMessage(message) {
    if (isEmpty(message)) {return} // should be unnecessary, as we should not ever send or receive en empty message

    this.handleCommands(message)
    this.handleDictionary(message)
    let restoredContainers = this.handleContainers(message)
    this.handleEvents(message)
    this.handleUserMessages(message)

    const eventName = message[INDICES.lowPrio] ? ALIAS.EVENT_SYNC_LOW : ALIAS.EVENT_SYNC
    this.dispatchEvent(eventName, {state: this.containers, changes: restoredContainers, message})
  }

  handleDictionary(message) {
    const dictUpdate = message[INDICES.dictionary]
    if (dictUpdate) {
      this.dict.updateShorts(dictUpdate)
      this.dispatchEvent(ALIAS.EVENT_DICTIONARY_UPDATE, dictUpdate)
    }
  }

  handleContainers(message) {
    let restoredContainers = {}
    const rawContainers = message[INDICES.containers]
    if (rawContainers) {
      for (const c in rawContainers) {
        rawContainers[c] = this.coder.unpack(rawContainers[c])
      }
      restoredContainers = this.dict.restoreObject(rawContainers)
      for (let k in restoredContainers) {
        if (this.containers[k] === undefined) {
          this.addContainer(k, new ObjectContainer())
        }
        this.applyContainerChanges(this.containers[k].pristine, restoredContainers[k])
      }
    }
    return restoredContainers
  }

  applyContainerChanges(containerState, containerChanges) {
    if (containerChanges[INDICES.deletes]) applyDeletes(containerState, containerChanges[INDICES.deletes])
    if (containerChanges[INDICES.merges]) merge(containerState, containerChanges[INDICES.merges])
    if (containerChanges[INDICES.meta]) applyMeta(containerState, containerChanges[INDICES.meta])
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
      this.dispatchEvent(e[0], ...e.slice(1))
    }
  }

  /**
   *
   * @param message
   */
  handleUserMessages(message) {
    const messages = message[INDICES.messages]
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
    const commands = message[INDICES.commands]
    if (!commands) return;
    let pointer = 0
    while (pointer < commands.length) {
      switch (commands[pointer]) {
        case COMMANDS.NEW_CONTAINER:
          const containerKey = commands[++pointer]
          if (!this.containers[containerKey]) {
            this.addContainer(containerKey, new ObjectContainer())
            this.dispatchEvent(ALIAS.EVENT_NEW_CONTAINER, commands[pointer])
          }
          break;
        case COMMANDS.NEW_CONTAINERS:
          for (const c of commands[++pointer]) {
            if (!this.containers[c]) {
              this.addContainer(c, new ObjectContainer())
              this.dispatchEvent(ALIAS.EVENT_NEW_CONTAINER, commands[pointer])
            }
          }
          break;
        default:
          console.error(`Unknown command received from server! Error at index: ${pointer}! Cancelling further processing of commands!`)
          console.error(commands);
          pointer = commands.length
      }
      pointer++
    }
  }

  fullUpdate() {
    throw new Error('Unavailable for client!')
  }

  sync() {
    const msg = {}
    this.bundleCommands(msg)
    this.bundleEvents(msg)
    this.bundleMessages(msg)
    this.send(msg)
    // this.client.clearSchedule() // not needed, the clear happens inside bundling
  }

  bundleEvents(message) {
    if (this.client.events.length > 0) {
      message[INDICES.events] = this.client.events
      this.client.events = []
    }
  }

  bundleMessages(message) {
    if (this.client.messages.length > 0) {
      message[INDICES.messages] = this.client.messages
      this.client.messages = []
    }
  }

  bundleCommands(message) {
    if (this.client.commands.length > 0) {
      message[INDICES.commands] = this.client.commands
      this.client.commands = []
    }
  }

  addClient(...args) {
    return this.setConnection(...args);
  }

  setConnection(...args) {
    this.client = this.driver.createClientObject(0, ...args);
    return this.client
  }

  send(message) {
    this.driver.send(this.client, message)
  }

  isReady() {
    return !!this.client
  }

  makeEvent(eventName, ...args) {
    return [eventName, ...args]
  }

  sendCommand(command) {
    const _message = []
    _message[INDICES.commands] = command
    this.send(_message)
  }

  sendCommandsArray(commands) {
    const commandArray = []
    for (let c of commands) {
      for (let e of c) {
        commandArray.push(e)
      }
    }
    this.sendCommand(commandArray)
  }

  sendCommands(...commands) {
    const commandArray = []
    for (let c of commands) {
      for (let e of c) {
        commandArray.push(e)
      }
    }
    this.sendCommand(commandArray)
  }

  sendMessage(message) {
    const _message = []
    _message[INDICES.messages] = message
    this.send(_message)
  }

  sendMessagesArray(messages) {
    const _message = []
    _message[INDICES.messages] = messages
    this.send(_message)
  }

  sendMessages(...messages) {
    const _message = []
    _message[INDICES.messages] = messages
    this.send(_message)
  }

  sendEvent(eventName, ...args) {
    const _message = []
    _message[INDICES.events] = [[eventName, ...args]]
    this.send(_message)
  }

  sendEventsArray(events) {
    const _message = []
    _message[INDICES.events] = events
    this.send(_message)
  }

  sendEvents(...events) {
    const _message = []
    _message[INDICES.events] = events
    this.send(_message)
  }

  scheduleCommand(command) {
    for (const c of command) {
      this.client.commands.push(c)
    }
  }

  scheduleMessage(message) {
    this.client.messages.push(message)
  }

  scheduleEvent(eventName, ...args) {
    this.client.events.push([[eventName, ...args]])
  }
}
