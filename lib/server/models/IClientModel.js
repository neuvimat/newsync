import {clear} from "@Lib/objUtil";

export class IClientModel {
  constructor(id) {
    this.id = id
    this.whitelist = new Set()
    this.allContainers = false
    this.fullUpdate = {}
    this.events = []
    this.commands = []
    this.messages = []
  }

  clearPersonalizedMessages() {
    this.events = []
    this.commands = []
    this.messages = []
  }

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

  blacklistContainer(containerName) {
    this.whitelist.delete(containerName)
    if (!this.fullUpdate) {
      delete this.fullUpdate[containerName]
    }
  }

  whitelistContainer(containerName) {
    if (!this.whitelist.has(containerName)) {
      this.whitelist.add(containerName)
      if (!this.allContainers) {
        this.fullUpdate[containerName] = true
      }
    }
  }

  clearSchedule() {
    this.events = []
    this.commands = []
    this.messages = []
  }

  clearWhitelist() {
    this.whitelist.clear()
    clear(this.fullUpdate)
  }
}
