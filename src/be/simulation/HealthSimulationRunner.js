import {createSimulation} from "@/be/model/CreateSimulation";
import {TargetAmbulanceMover} from "@/be/simulation/TargetAmbulanceMover";
import {RandomAmbulanceMover} from "@/be/simulation/RandomAmbulanceMover";

/**
 * This class creates random initial data to the passed 'state' object. It also allows simple iteration over the
 * simulation. It keeps track of 'Movers' which dictate that vehicle is in motion and in which direction.
 *
 * There are multiple 'movers', one that makes the car move in random direction, the other that makes it move to
 * specific GPS location.
 */
export class HealthSimulationRunner {
  state
  lastIteration = 0;

  /**
   *
   * @param state {object} object representing the simulation whose state will be updated
   * @param hospitals {number} amount of random hospitals in initial state
   * @param ambulances {number} amount of random ambulances in initial state
   */
  constructor(state, hospitals, ambulances) {
    this.state = state
    createSimulation(state, hospitals, ambulances)
    this.ambulanceMovers = new Map()
    this.lastIteration = new Date().getTime()
  }

  /**
   * Makes an ambulance with the specified ID moving to the target coordinates
   * @param id {string} id of ambulance to move
   * @param target {[number, number]} target location represented as latitude, longitude
   */
  moveAmbulanceTarget(id, target) {
    this.ambulanceMovers.set(id, new TargetAmbulanceMover(id, target))
  }

  /**
   * Makes an ambulance with the specified ID moving in random direction.
   * @param id {string} id of ambulance to move
   */
  moveAmbulanceRandom(id) {
    this.ambulanceMovers.set(id, new RandomAmbulanceMover(id))
  }

  /**
   * Recalls an ambulance with the specified ID back to its assigned hospital.
   * @param id {string} id of ambulance to recall
   */
  recallAmbulance(id) {
    let targetHospitalId = this.state.ambulances[id]?.hospital
    let targetHospital = this.state.hospitals[targetHospitalId]
    if (targetHospital) {
      const target = [targetHospital.pos.lon, targetHospital.pos.lat]
      this.moveAmbulanceTarget(id, target)
    }
  }

  /**
   * Stops the ambulance with the specified id.
   * @param id {string} id of ambulance to stop
   */
  stop(id) {
    this.ambulanceMovers.delete(id)
  }

  /**
   * Stops movement of all ambulances
   */
  stopAll() {
    this.ambulanceMovers.clear()
  }

  /**
   * Makes the first X ambulances moving in a random direction. X is the quantity parameter.
   * @param quantity {number}
   */
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

  /**
   * Do one step of the simulation and move all non-stationary ambulances in their movement direction.
   */
  iterate() {
    const t = new Date().getTime()
    const delta = t-this.lastIteration
    for (const m of this.ambulanceMovers.values()) {
      m.iterate(this.state, delta, this)
    }
    this.lastIteration = t
  }
}
