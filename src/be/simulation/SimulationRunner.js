import {createSimulation} from "@/be/model/CreateSimulation";
import {TargetAmbulanceMover} from "@/be/simulation/TargetAmbulanceMover";
import {RandomAmbulanceMover} from "@/be/simulation/RandomAmbulanceMover";

export class SimulationRunner {
  state
  lastIteration = 0;

  constructor(state, hospitals, ambulances) {
    this.state = state
    createSimulation(state)
    this.ambulanceMovers = new Map()
    this.lastIteration = new Date().getTime()
  }

  moveAmbulanceTarget(id, target) {
    this.ambulanceMovers.set(id, new TargetAmbulanceMover(id, target))
  }

  moveAmbulanceRandom(id) {
    this.ambulanceMovers.set(id, new RandomAmbulanceMover(id))
  }

  recallAmbulance(id) {
    let targetHospitalId = this.state.ambulances[id]?.hospital
    let targetHospital = this.state.hospitals[targetHospitalId]
    if (targetHospital) {
      const target = [targetHospital.pos.lon, targetHospital.pos.lat]
      this.moveAmbulanceTarget(id, target)
    }
  }

  stop(id) {
    this.ambulanceMovers.delete(id)
  }

  stopAll() {
    this.ambulanceMovers.clear()
  }

  moveQuantity(quantity) {
    let pointer = 0;
    const max = Object.keys(this.state.ambulances).length
    for (let i = this.ambulanceMovers.size; i < quantity; i++) {
      while (pointer < max) {
        if (!this.ambulanceMovers.has(pointer)) {
          this.moveAmbulanceRandom(pointer)
          pointer++
          break;
        }
        pointer++
      }
    }
  }

  iterate() {
    const t = new Date().getTime()
    const delta = t-this.lastIteration
    for (const m of this.ambulanceMovers.values()) {
      m.iterate(this.state, delta, this)
    }
    this.lastIteration = t
  }
}
