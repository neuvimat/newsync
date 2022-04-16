export class IClientModel {
  constructor(id) {
    this.id = id
    this.blacklist = new Set()
  }

  ignoreContainer(containerName) {
    this.blacklist.add(containerName)
  }

  whitelistContainer(containerName) {
    this.blacklist.delete(containerName)
  }
}
