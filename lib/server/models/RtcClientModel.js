import {IClientModel} from "@Lib/server/models/IClientModel";

export class RtcClientModel extends IClientModel{
  constructor(id, rtcConnection, dataChannel, lowPrioChannel) {
    super(id)
    this.rtcConnection = rtcConnection
    this.dataChannel = dataChannel
    this.lowPrioChannel = lowPrioChannel
    this.canUseLowPrioChannel = lowPrioChannel !== undefined
  }

  attemptToCreateLowPrioChannel(channelName = 'NewSyncLowPrio') {
    if (this.lowPrioChannel === undefined) {
      console.log('No low prio channel exists, attempting to create one automatically!');
      let _resolve, _reject, canTimeout = true;

      const p = new Promise((resolve, reject)=>{
        _resolve = resolve
        _reject = reject
        this.lowPrioChannel = this.rtcConnection.createDataChannel(channelName, {ordered: false, maxRetransmits: 0})
        this.lowPrioChannel.on
        this.lowPrioChannel.onopen = event => {
          if (canTimeout === true) {
            canTimeout = false
            this.canUseLowPrioChannel = true
            resolve()
          }
        }
        this.lowPrioChannel.addEventListener('open',(event)=>{
          console.log('low prio channel onpeded!');
        })
        this.lowPrioChannel.onmessage = msg => {
          if (canTimeout) {
            canTimeout = false
            this.canUseLowPrioChannel = true
            resolve()
          }
          // There is a bug in the node library that implements wrtc: it does not fire the onopen event!
          // So instead the client has to send a message that acts as a ping that makes us aware of channel being open
        }
        this.lowPrioChannel.onclose = event => {
          this.lowPrioChannel = undefined
          this.canUseLowPrioChannel = false
        }
        this.lowPrioChannel.onerror = event => {
          this.lowPrioChannel = undefined
          this.canUseLowPrioChannel = false
          console.error(event)
        }
      })

      setTimeout(()=>{
        if (canTimeout) {
          canTimeout = false
          this.canUseLowPrioChannel = false
          this.lowPrioChannel.close()
          this.lowPrioChannel = undefined
          _reject('RctClientModel reached a timeout during low prio channel creation!!')
        }
      }, 5000)

      return p;
    }
    else {
      throw new Error('RctClientModel is already trying to open new data channel!')
    }
  }
}
