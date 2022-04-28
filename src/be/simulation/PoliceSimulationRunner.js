import {createSimulation, createSimulationPolice} from "@/be/model/CreateSimulation";
import {TargetAmbulanceMover} from "@/be/simulation/TargetAmbulanceMover";
import {RandomAmbulanceMover} from "@/be/simulation/RandomAmbulanceMover";
import {TargetPoliceMover} from "@/be/simulation/TargetPoliceMover";
import {RandomCarMover} from "@/be/simulation/RandomCarMover";

/**
 * Yes, this class is a filthy copy paste of {@link SimulationRunner} with just slightly altered state definitions
 */
export class PoliceSimulationRunner {
  state
  lastIteration = 0;

  constructor(state, stations, cars) {
    this.state = state
    createSimulationPolice(state, stations, cars)
    this.policeMovers = new Map()
    this.lastIteration = new Date().getTime()
  }

  moveCarTarget(id, target) {
    this.policeMovers.set(id, new TargetPoliceMover(id, target))
  }

  moveCarRandom(id) {
    this.policeMovers.set(id, new RandomCarMover(id))
  }

  recallCar(id) {
    let targetStationId = this.state.cars[id]?.station
    let targetStation = this.state.stations[targetStationId]
    if (targetStation) {
      const target = [targetStation.pos.lon, targetStation.pos.lat]
      this.moveCarTarget(id, target)
    }
  }

  stop(id) {
    this.policeMovers.delete(id)
  }

  stopAll() {
    this.policeMovers.clear()
  }

  moveQuantity(quantity) {
    let pointer = 0;
    const max = Object.keys(this.state.cars).length
    for (let i = this.policeMovers.size; i < quantity; i++) {
      while (pointer < max) {
        if (!this.policeMovers.has(pointer)) {
          this.moveCarRandom(pointer)
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
    for (const m of this.policeMovers.values()) {
      m.iterate(this.state, delta, this)
    }
    this.lastIteration = t
  }
}
