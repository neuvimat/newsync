// noinspection DuplicatedCode

import {IDriverClient} from "@Lib/client/drivers/_IDriver";
import {WebSocketClientModel} from "@Lib/server/models/WebSocketClientModel";

export class WebSocketDriverServer extends IDriverClient {
  _prefix

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

  sendToAll(object) {
    const data = this.newSync.coder.pack(object)
    const wholeMessage = new Uint8Array(this._prefixBytes.length + data.length)
    wholeMessage.set(this._prefixBytes, 0)
    wholeMessage.set(data, this._prefixBytes.length)
    const clients = this.newSync.clients
    for (let c in clients) {
      clients[c].socket.send(wholeMessage)
    }
  }

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
}
