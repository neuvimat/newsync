export class IClientModel {
  constructor(id) {
    this.id = id
    this.whitelist = new Set()
    this.allContainers = false
    this.events = []
    this.commands = []
    this.messages = []
  }

  clearPersonalizedMessages() {
    this.events = []
    this.commands = []
    this.messages = []
  }

  requestAllContainers(boolean) {
    this.allContainers = boolean
  }

  blacklistContainer(containerName) {
    this.whitelist.delete(containerName)
  }

  whitelistContainer(containerName) {
    this.whitelist.add(containerName)
  }

  clearWhitelist() {
    this.whitelist.clear()
  }
}
