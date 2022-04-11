export class IDriverClient {
  /** @type {NewSyncServer} */
  newSync

  send() {
    throw new Error('Not yet implemented!')
  }

  sendToAll() {
    throw new Error('Not yet implemented!')
  }

  createClientObject(id, ...args) {
    throw new Error('Not yet implemented!')
  }

  // Serves as a cleanup possibility, the removal from client map happens a level higher (NewSyncInstance)
  removeClient() {
    throw new Error('Not yet implemented!')
  }

  extractMessage() {
    throw new Error('Not yet implemented!')
  }

  isFrameworkMessage(data) {
    throw new Error('Not yet implemented!')
  }

  install(...args) {
    throw new Error('Not yet implemented!')
  }
}
