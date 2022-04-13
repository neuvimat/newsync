export class RtcClientModel {
  constructor(id, rtcConnection, dataChannel, lowPrioChannel) {
    this.id = id
    this.rtcConnection = rtcConnection
    this.dataChannel = dataChannel
    this.lowPrioChannel = lowPrioChannel
    this.canUseLowPrioChannel = lowPrioChannel !== undefined
  }

  attemptToCreateLowPrioChannel(channelName = 'NewSyncLowPrio') {
    if (this.lowPrioChannel === undefined) {
      let _resolve, _reject, canTimeout = true;

      const p = new Promise((resolve, reject)=>{
        _resolve = resolve
        _reject = reject
        this.lowPrioChannel = this.rtcConnection.createDataChannel(channelName, {ordered: false, maxRetransmits: 0})
        this.lowPrioChannel.onopen = event => {
          if (canTimeout === true) {
            canTimeout = false
            this.canUseLowPrioChannel = true
            resolve()
          }
        }
        this.lowPrioChannel.onmessage = msg => {
          throw new Error('RctClientModel received a message from Client on low prio channel! That should not have ever happened!')
        }
        this.lowPrioChannel.onclose = event => {
          this.lowPrioChannel = undefined
          this.canUseLowPrioChannel = false
          throw new Error('RctClientModel low prio channel was closed unexpectedly!')
        }
        this.lowPrioChannel.onerror = event => {
          this.lowPrioChannel = undefined
          this.canUseLowPrioChannel = false
          console.error(event)
          throw new Error('RctClientModel low prio received an error!')
        }
      })

      setTimeout(()=>{
        if (canTimeout) {
          canTimeout = false
          this.canUseLowPrioChannel = false
          this.lowPrioChannel.close()
          this.lowPrioChannel = undefined
          _reject('RctClientModel reached and timeout during low prio channel creation!')
        }
      }, 10000)

      return p;
    }
    else {
      throw new Error('RctClientModel is already trying to open new data channel!')
    }
  }
}
