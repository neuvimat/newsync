// noinspection DuplicatedCode

import {IDriverClient} from "@Lib/client/drivers/IDriverClient";
import {WebSocketClientModel} from "@Lib/server/models/WebSocketClientModel";
import {IDriverServer} from "@Lib/server/drivers/IDriverServer";

/**
 * WebSocket based implementation of {@link IDriverServer}. Does not support low priority channels. Has a configurable
 * prefix set inside the constructor to allow direct identification of NewSync messages from regular traffic inside
 * the Websocket connection.
 *
 * When adding a client to NewSync, make sure to specify all the required parameters inside {@link createClientObject}!
 * The id is auto-injected by NewSync, the rest is up to you.
 * @implements {IDriverServer}
 */
export class WebSocketDriverServer extends IDriverServer {
  _prefix

  newSync

  /**
   *
   * @param prefix {string} prefix that will be auto-injected to every message to allow it to be distinguished from
   * other, non-NewSync traffic inside the websocket connection. Prefix can be empty to disable this behavior.
   */
  constructor(prefix = '&') {
    super();
    this.prefix = prefix
  }

  set prefix(val) {
    this._prefix = val
    this._prefixBytes = new TextEncoder().encode(val)
  }

  get prefix() {
    return this._prefix
  }

  send(client, message) {
    const data = this.newSync.coder.pack(message)
    const wholeMessage = new Uint8Array(this._prefixBytes.length + data.length)
    wholeMessage.set(this._prefixBytes, 0)
    wholeMessage.set(data, this._prefixBytes.length)
    client.socket.send(wholeMessage)
  }

  sendToAll(message) {
    const data = this.newSync.coder.pack(message)
    const wholeMessage = new Uint8Array(this._prefixBytes.length + data.length)
    wholeMessage.set(this._prefixBytes, 0)
    wholeMessage.set(data, this._prefixBytes.length)
    const clients = this.newSync.clients
    for (let c in clients) {
      clients[c].socket.send(wholeMessage)
    }
  }

  /**
   *
   * @param id {number} autofilled by NewSync
   * @param socket {WebSocket} websocket socket
   * @return {WebSocketClientModel}
   */
  createClientObject(id, socket) {
    return new WebSocketClientModel(id, socket)
  }

  removeClient(client) {
    // Can do some cleanup here
  }

  extractMessage(data) {
    if (typeof data === 'string') {
      const prefixMatch = data.substring(0, this.prefix.length) === this.prefix
      if (prefixMatch) {
        return this.newSync.coder.unpack(data.substring(this.prefix.length))
      }
      else {return false}
    }
    else if (this.isBinary(data)) {
      data = new Uint8Array(data)
      for (let i = 0; i < this._prefixBytes.length; i++) {
        if (data[i] !== this._prefixBytes[i]) return false
      }
      return this.newSync.coder.unpack(Uint8Array.from(data.slice(this._prefixBytes.length)))
    }
    return false
  }

  isFrameworkMessage(data) {
    if (typeof data === 'string') {
      return data.substring(0, this.prefix.length) === this.prefix
    }
    else if (data instanceof ArrayBuffer) {
      data = new Uint8Array(data)
      for (let i = 0; i < this._prefixBytes.length; i++) {
        if (data[i] !== this._prefixBytes[i]) return false
      }
      return true
    }
    return false
  }

  install(ws) {

  }

  isLowPrioSupported() {
    return false;
  }

  sendToAllLowPrio(message) {
    // Technically we should not get here, because NewSync and any responsible programmer should use
    // isLowPrioSupported before sending, but just in case
    console.warn('WebSocketDriver does not support low priority messages! Using regular send as fallback!')
    this.sendToAll(message)
  }

  isBinary(data) {
    return data instanceof Buffer; // In the browsers, we get ArrayBuffer, in node.js, we get just Buffer
  }

  packMessage(message) {
    const msgPackMessage = this.newSync.coder.pack(message)
    const wholeMessage = new Uint8Array(this._prefixBytes.length + msgPackMessage.length)
    wholeMessage.set(this._prefixBytes, 0)
    wholeMessage.set(msgPackMessage, this._prefixBytes.length)
    return wholeMessage
  }

  sendData(client, data) {
    const wholeMessage = new Uint8Array(this._prefixBytes.length + data.length)
    wholeMessage.set(this._prefixBytes, 0)
    wholeMessage.set(data, this._prefixBytes.length)
    client.socket.send(wholeMessage)
  }

  sendDataLowPrio(client, data) {
    console.warn('WebSocketDriver does not support low priority messages! Using regular send as fallback!')
    this.sendData(client, data);
  }

  sendLowPrio(client, message) {
    console.warn('WebSocketDriver does not support low priority messages! Using regular send as fallback!')
    this.send(client, message)
  }

  sendToAllPrio(message) {

  }
}
