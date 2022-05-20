import {clear} from "@Lib/util/objUtil";

/**
 * Abstract class representing a NewSync client connection that implements shared functionality between all clients no
 * matter the connection type.
 * @abstract
 * @class
 */
export class AbstractClientModel {
  constructor(id) {
    /** Id of the client given by NewSync */
    this.id = id
    /** What container the client subcribed to */
    this.whitelist = new Set()
    /** All containers subscription override */
    this.allContainers = false
    /** Dictionary of containers to receive full update of */
    this.fullUpdate = {}
    /** personalized scheduled events */
    this.events = []
    /** personalized scheduled commands */
    this.commands = []
    /** personalized scheduled messages */
    this.messages = []
  }

  /**
   * Clears all personalized messages, events and commands
   */
  clearPersonalizedMessages() {
    this.events = []
    this.commands = []
    this.messages = []
  }

  /**
   * Subscribes/unsubscribes to/from all listed containers
   * @param boolean {boolean} true if subscribe to all, false if unsub from all
   * @param containers {} list of containers to (un)subcribe to (from)
   */
  requestAllContainers(boolean, containers) {
    if (this.allContainers === boolean) return
    this.allContainers = boolean
    if (boolean) {
      const newFullUpdate = {}
      for (const k in containers) {
        if (!this.whitelist.has(k)) {
          newFullUpdate[k] = true
        }
      }
      this.fullUpdate = newFullUpdate
    }
    else {
      for (const k in containers) {
        if (!this.whitelist.has(k)) {
          delete this.fullUpdate[k]
        }
      }
    }
  }

  /**
   * Unsubscribe to a container by its ID in NewSync
   * @param containerName {string}
   */
  blacklistContainer(containerName) {
    this.whitelist.delete(containerName)
    if (!this.fullUpdate) {
      delete this.fullUpdate[containerName]
    }
  }

  /**
   * Subscribe to a container by its ID in NewSync
   * @param containerName {string}
   */
  whitelistContainer(containerName) {
    if (!this.whitelist.has(containerName)) {
      this.whitelist.add(containerName)
      if (!this.allContainers) {
        this.fullUpdate[containerName] = true
      }
    }
  }

  /**
   * Alias to {@link clearPersonalizedMessages}
   */
  clearSchedule() {
    this.events = []
    this.commands = []
    this.messages = []
  }

  /**
   * Unsubscribe from all containers
   */
  clearWhitelist() {
    this.whitelist.clear()
    clear(this.fullUpdate)
  }
}
