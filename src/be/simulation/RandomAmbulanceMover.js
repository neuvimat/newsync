import {clampAbs} from "@Lib/util/math";
import {Ambulance} from "@/be/model/ambulance";

export class RandomAmbulanceMover {
  constructor(ambulanceId) {
    this.ambulanceId = ambulanceId
  }

  iterate(state, delta, simRunner) {
    const a = state.ambulances[this.ambulanceId]
    if (a) {
      Ambulance.moveAmbulance(a)
    }
  }
}
