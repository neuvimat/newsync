import {clampAbs} from "@Lib/util/math";

const POLICE_SPEED = .1 // per second in GPS

export class TargetPoliceMover {
  constructor(carId, target) {
    this.carId = carId
    this.target = target
  }

  setTarget(target) {
    this.target = target
  }

  iterate(state, delta, simRunner) {
    if (!this.target) return
    const a = state.cars[this.carId]
    if (a) {
      const diffX = clampAbs(this.target[0] - a.pos.lon, POLICE_SPEED / 1000 * delta)
      const diffY = clampAbs(this.target[1] - a.pos.lat, POLICE_SPEED / 1000 * delta)
      if (diffX === 0 && diffY === 0) {
        a.pos.lon = this.target[0] // Just to make sure some precisions error will not show up
        a.pos.lat = this.target[1] // Just to make sure some precisions error will not show up
        simRunner.policeMovers.delete(this.carId)
      }
      else {
        a.pos.lon += diffX
        a.pos.lat += diffY
      }
    }
  }
}
