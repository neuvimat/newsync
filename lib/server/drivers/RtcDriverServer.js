import {IDriverClient} from "@Lib/client/drivers/_IDriver";
import {RtcClientModel} from "@Lib/server/RtcClientModel";

export class RtcDriverServer extends IDriverClient {
  constructor() {
    super()
  }

  createClientObject(id, ...args) {
    return new RtcClientModel(id, ...args);
  }

  extractMessage(data) {
    data = new Uint8Array(data)
    return this.newSync.coder.unpack(data) || {}
    // return false
  }

  install(...args) {
    return undefined;
  }

  isFrameworkMessage(data) {
    return undefined;
  }

  isLowPrioSupported() {
    return undefined;
  }

  removeClient() {
    // Can do some cleanup here
  }

  send(object, client) {
    const msgPackMessage = this.newSync.coder.pack(object)
    client.dataChannel.send(msgPackMessage)
  }

  sendToAll(object) {
    const msgPackMessage = this.newSync.coder.pack(object)
    const clients = this.newSync.clients
    for (let c in clients) {
      if (clients[c].dataChannel.readyState === 'open') {
        clients[c].dataChannel.send(msgPackMessage)
      }
    }
    console.log('driver send message via dataChannel');
  }

  sendToAllLowPrio(message) {
    const msgPackMessage = this.newSync.coder.pack(message)
    const clients = this.newSync.clients
    for (let c in clients) {
      if (clients[c].dataChannel.readyState === 'open') {
        clients[c].dataChannel.send(msgPackMessage)
      }
    }
  }

  isBinary(message) {
    return message instanceof Buffer;
  }

  packMessage(message) {
    return this.newSync.coder.pack(message)
  }
}
