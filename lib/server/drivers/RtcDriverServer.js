import {RtcClientModel} from "@Lib/server/models/RtcClientModel";
import {INDICES} from "@Lib/shared/SYMBOLS";
import {IDriverServer} from "@Lib/server/drivers/IDriverServer";

/**
 * WebRTC implementation of the {@link IDriverServer}.
 *
 * When adding a client to NewSync, make sure to specify all the required parameters inside {@link createClientObject}!
 * The id is auto-injected by NewSync, the rest is up to you.
 * @implements IDriverServer
 */
export class RtcDriverServer extends IDriverServer {
  newSync

  constructor() {
    super()
  }

  /**
   *
   * @param id {number} autofilled by NewSync
   * @param rtcConnection {RTCPeerConnection} the peer connection itself
   * @param dataChannel {RTCDataChannel} main, reliable data channel
   * @param [lowPrioChannel] {RTCDataChannel} secondary, low prio channel, optional
   * @return {RtcClientModel}
   */
  createClientObject(id, rtcConnection, dataChannel, lowPrioChannel) {
    return new RtcClientModel(id, rtcConnection, dataChannel, lowPrioChannel);
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

  removeClient(client) {
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

  sendToAllPrio(message) {
  }

  sentToAll(message) {
  }
}
