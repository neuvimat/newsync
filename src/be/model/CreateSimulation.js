import {Hospital} from "./hospital";
import {Random} from "../../../lib/random";
import {Ambulance} from "./ambulance";

export function createSimulation(sim, HOSPITALS_NUM = 4, AMBULANCE_NUM = 12) {
  sim.hospitals = {}
  sim.ambulances = {}
  for (let i = 0; i < HOSPITALS_NUM; i++) {
    let h = Hospital.make(i, Random.string(8,30), Random.string(10,50), [], Random.float(46,52), Random.float(17,21))
    sim.hospitals[i] = h
  }
  for (let i = 0; i < AMBULANCE_NUM; i++) {
    let a = Ambulance.make(i, Random.string(8,30), Random.float(46,52), Random.float(17,21))
    sim.hospitals[Random.int(0, HOSPITALS_NUM)].ambulances.push(i)
    sim.ambulances[i] = a
  }
  return sim;
}
