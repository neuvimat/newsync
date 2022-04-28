import {clampAbs} from "@Lib/util/math";
import {Ambulance} from "@/be/model/ambulance";

export class RandomCarMover {
  constructor(carId) {
    this.carId = carId
  }

  iterate(state, delta, simRunner) {
    const a = state.cars[this.carId]
    if (a) {
      Ambulance.moveAmbulance(a)
    }
  }
}
