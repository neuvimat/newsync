import * as msgpckr from 'msgpackr'

const encoder = new TextEncoder()

/**
 * Incoming data from server are rerouted and handled here
 */
export class Receiver {
  constructor(ui, clientState) {
    this.ui = ui;
    this.clientState = clientState;
    this.sizes = {total: 0, full: 0, delta: 0, fullMP: 0, deltaMP: 0}
  }

  handleMessage([full, delta]) {
    // The server does not actually send msgpacked data it sends only JSON data. To get the MessagePack size we will
    // pack it here instead.
    const jsonFull = JSON.stringify(full)
    const jsonDelta = JSON.stringify(delta)
    const fullSize = encoder.encode(JSON.stringify(full)).length
    const deltaSize = encoder.encode(JSON.stringify(delta)).length

    const fullMPSize = msgpckr.pack(full).length
    const deltaMPSize = msgpckr.pack(delta).length

    const sizes = this.sizes
    sizes.total += fullSize + deltaSize + fullMPSize + deltaMPSize
    sizes.full += fullSize
    sizes.delta += deltaSize
    sizes.fullMP += fullMPSize
    sizes.deltaMP += deltaMPSize

    this.clientState.applyDelta(delta)

    this.ui.updateState(full)
    this.ui.addHistoryRecord(jsonFull, fullSize, jsonDelta, deltaSize, fullMPSize, deltaMPSize)
    this.ui.updateStatusBar(sizes.total, sizes.full, sizes.delta, sizes.fullMP, sizes.deltaMP)
  }
}
