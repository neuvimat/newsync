// noinspection DuplicatedCode
import {COMMANDS} from "@Lib/shared/COMMANDS";

const placeholder = Symbol('placeholder')

import {clear, isEmpty, merge} from "@Lib/objUtil";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {KEYWORDS_FROM, KEYWORDS} from "@Lib/shared/SYMBOLS";
import {ALIAS} from "@Lib/shared/ALIAS";

export class NewSyncClient extends NewSyncServer {
  client = null // this is the actual connection to the server, so it might be a bit misleading, perhaps peer would be better?
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

    const eventName = message[KEYWORDS.lowPrio] ? ALIAS.EVENT_SYNC_LOW : ALIAS.EVENT_SYNC
    this.dispatchEvent(eventName, {state: this.containers, changes: restoredContainers, message})
  }

  handleDictionary(message) {
    const dictUpdate = message[KEYWORDS.dictionary]
    if (dictUpdate) {
      this.dict.updateShorts(dictUpdate)
      this.dispatchEvent(ALIAS.EVENT_DICTIONARY_UPDATE, dictUpdate)
    }
  }

  handleContainers(message) {
    let containers = {}
    const rawContainers = message[KEYWORDS.containers]
    if (rawContainers) {
      for (const c in rawContainers) {
        rawContainers[c] = this.coder.unpack(rawContainers[c])
      }
      containers = this.dict.restoreObject(rawContainers)
      for (let k in containers) {
        if (this.containers[k] === undefined) {
          this.addContainer(k, new SimpleContainer())
        }
        const old = this.containers[k].pristine
        merge(this.containers[k].pristine, containers[k])
      }
    }
    return containers
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
      this.dispatchEvent(e[0], ...e.slice(1))
    }
  }

  /**
   *
   * @param message
   */
  handleUserMessages(message) {
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
        case COMMANDS.NEW_CONTAINER:
          const containerKey = commands[++pointer]
          if (!this.containers[containerKey]) {
            this.addContainer(containerKey, new SimpleContainer())
            this.dispatchEvent(ALIAS.EVENT_NEW_CONTAINER, commands[pointer])
          }
          break;
        case COMMANDS.NEW_CONTAINERS:
          for (const c of commands[++pointer]) {
            if (!this.containers[c]) {
              this.addContainer(containerKey, new SimpleContainer())
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
    // todo: send all schedule messages, but that is it
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

  sendCommand(command) {
    this.send({[KEYWORDS.commands]: command})
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
}
