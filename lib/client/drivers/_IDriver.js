/**
 * @interface
 */
export class IDriverClient {
  /** @type {NewSyncServer} */
  newSync

  /**
   * @abstract
   */
  send(message) {
    throw new Error('Not yet implemented!')
  }

  /**
   * @abstract
   */
  sendLowPrio(message) {
    throw new Error('Not yet implemented!')
  }

  /**
   * @abstract
   */
  sendToAll(message) {
    throw new Error('Not yet implemented!')
  }

  /**   * @abstract   */
  sendToAllLowPrio(message) {
    throw new Error('Not yet implemented!')
  }

  /**   * @abstract   */
  sendData(data) {throw new Error('Not yet implemented!')}
  /**   * @abstract   */
  sendDataLowPrio(data) {throw new Error('Not yet implemented!')}

  /**
   * @abstract
   */
  isLowPrioSupported() {
    throw new Error('Not yet implemented!')
  }

  /**
   * @abstract
   */
  createClientObject(id, ...args) {
    throw new Error('Not yet implemented!')
  }


  /**
   * Serves as a cleanup possibility, the removal from client map happens a level higher (NewSyncInstance)
   * @abstract
   */
  removeClient(id, client) {
    throw new Error('Not yet implemented!')
  }

  /**
   * @abstract
   */
  extractMessage(data) {
    throw new Error('Not yet implemented!')
  }

  /**
   * @abstract
   */
  isFrameworkMessage(data) {
    throw new Error('Not yet implemented!')
  }

  /**
   * @abstract
   */
  install(...args) {
    throw new Error('Not yet implemented!')
  }

  /**
   * @abstract
   * @param message
   */
  isBinary(data) {
    throw new Error('Not yet implemented!')
  }

  /**
   * @abstract
   * @param message
   */
  packMessage(message) {

  }


}
