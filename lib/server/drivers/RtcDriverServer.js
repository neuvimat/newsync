import {IDriverClient} from "@Lib/client/drivers/_IDriver";
import {RtcClientModel} from "@Lib/server/models/RtcClientModel";

export class RtcDriverServer extends IDriverClient {
  constructor() {
    super()
  }

  createClientObject(id, ...args) {
    return new RtcClientModel(id, ...args);
  }

  extractMessage(data) {
    data = new Uint8Array(data)
    return this.newSync.coder.unpack(data) || {} // msgpackr sees empty objects as undefined for whatever reason at times
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

  send(object, client) {
    const data = this.newSync.coder.pack(object)
    client.dataChannel.send(data)
  }

  sendToAll(object) {
    const data = this.newSync.coder.pack(object)
    const clients = this.newSync.clients
    for (let c in clients) {
      if (clients[c].dataChannel.readyState === 'open') {
        clients[c].dataChannel.send(data)
      }
    }
  }

  sendToAllLowPrio(message) {
    message[this.newSync.dict.shorten('lowPrio')] = true
    const data = this.newSync.coder.pack(message)
    const clients = this.newSync.clients
    for (let c in clients) {
      if (clients[c].canUseLowPrioChannel && clients[c].lowPrioChannel.readyState === 'open') {
        clients[c].lowPrioChannel.send(data)
      }
      else if (clients[c].lowPrioChannel === undefined) {
        clients[c].attemptToCreateLowPrioChannel().catch((reason)=>{
          console.log('some error', reason);
        })
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
