import {clampAbs} from "@Lib/util/math";

const AMBULANCE_SPEED = .1 // per second in GPS

export class TargetAmbulanceMover {
  constructor(ambulanceId, target) {
    this.ambulanceId = ambulanceId
    this.target = target
  }

  setTarget(target) {
    this.target = target
  }

  iterate(state, delta, simRunner) {
    if (!this.target) return
    const a = state.ambulances[this.ambulanceId]
    if (a) {
      const diffX = clampAbs(this.target[0] - a.pos.lon, AMBULANCE_SPEED / 1000 * delta)
      const diffY = clampAbs(this.target[1] - a.pos.lat, AMBULANCE_SPEED / 1000 * delta)
      if (diffX === 0 && diffY === 0) {
        a.pos.lon = this.target[0] // Just to make sure some precisions error will not show up
        a.pos.lat = this.target[1] // Just to make sure some precisions error will not show up
        simRunner.ambulanceMovers.delete(this.ambulanceId)
      }
      else {
        a.pos.lon += diffX
        a.pos.lat += diffY
      }
    }
  }
}
