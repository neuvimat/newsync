import {IDriverClient} from "@Lib/client/drivers/_IDriver";
import {RtcClientModel} from "@Lib/server/models/RtcClientModel";
import {INDICES} from "@Lib/shared/SYMBOLS";

export class RtcDriverServer extends IDriverClient {
  constructor() {
    super()
  }

  createClientObject(id, ...args) {
    return new RtcClientModel(id, ...args);
  }

  extractMessage(data) {
    data = new Uint8Array(data)
    return this.newSync.coder.unpack(data) || {} // occasionally undefined ended up here, hence the || {}
    // return false
  }

  install(...args) {
    return undefined;
  }

  isFrameworkMessage(data) {
    return true;
  }

  isLowPrioSupported() {
    return true;
  }

  removeClient() {
    // Can do some cleanup here
  }

  send(client, message) {
    const data = this.newSync.coder.pack(message)
    this.sendData(client, data)
  }

  sendToAll(message) {
    const data = this.newSync.coder.pack(message)
    const clients = this.newSync.clients
    for (let c in clients) {
      this.sendData(clients[c], data)
    }
  }

  sendToAllLowPrio(message) {
    message[INDICES.lowPrio] = true
    const data = this.newSync.coder.pack(message)
    const clients = this.newSync.clients
    for (let c in clients) {
      this.sendDataLowPrio(clients[c], data)
    }
  }

  isBinary(message) {
    return message instanceof Buffer;
  }

  packMessage(message) {
    return this.newSync.coder.pack(message)
  }

  sendLowPrio(client, message) {
    if (client.canUseLowPrioChannel && client.lowPrioChannel.readyState === 'open') {
      message[INDICES.lowPrio] = true
      client.lowPrioChannel.send(this.newSync.coder.pack(message))
    }
    else if (client.lowPrioChannel === undefined) {
      client.attemptToCreateLowPrioChannel().catch((reason)=>{
        console.log('some error', reason);
      })
    }
  }

  sendData(client, data) {
    client.dataChannel.send(data)
  }

  sendDataLowPrio(client, data) {
    if (client.canUseLowPrioChannel && client.lowPrioChannel.readyState === 'open') {
      client.lowPrioChannel.send(data)
    }
    else if (client.lowPrioChannel === undefined) {
      client.attemptToCreateLowPrioChannel().catch((reason)=>{
        console.log('some error', reason);
      })
    }
  }
}
