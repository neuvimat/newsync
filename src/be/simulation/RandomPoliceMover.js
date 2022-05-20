import {clampAbs} from "@Lib/util/math";
import {Ambulance} from "@/be/model/ambulance";
import {Car} from "@/be/model/car";

export class RandomAmbulanceMover {
  constructor(ambulanceId) {
    this.ambulanceId = ambulanceId
  }

  iterate(state, delta, simRunner) {
    const a = state.cars[this.ambulanceId]
    if (a) {
      Car.moveCar(a)
    }
  }
}
