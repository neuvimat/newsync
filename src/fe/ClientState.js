import {clear, merge} from "../../lib/objUtil";
import _ from 'lodash'

/**
 * Manages the local state and synchronizes it with the server
 */
export class ClientState {
  constructor(pristine, proxy, changes) {
    this.pristine = pristine
    this.proxy = proxy
    this.changes = changes

    setInterval(()=>{this.sync()}, 1000)
  }

  setRtcChannel(channel) {
    this.channel = channel
  }

  /**
   * Applies the delta changes received from the server
   * @param delta
   */
  applyDelta(delta) {
    // We apply the changes to the pristine, non-proxied object, otherwise all the changes would be considered as made
    // by the client and sent back to the server for synchronization
    merge(this.pristine, delta)
  }

  /**
   * Sync the changes made by the client, if there are any, and if the channel is open
   * The changes are made via browser console or the command prompt in the html
   * It is possible to access the state by a 'sim' key. Type sim.hospitals[0].name = 'lol' to change the state
   */
  sync() {
    if (this.channel && !_.isEmpty(this.changes)) {
      this.channel.send(JSON.stringify(this.changes))
    }
    clear(this.changes)
  }
}
