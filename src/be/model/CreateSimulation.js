import {Hospital} from "./hospital";
import {Random} from "@Lib/random";
import {Ambulance} from "./ambulance";
import {Car} from "@/be/model/car";
import {Station} from "@/be/model/station";

/**
 * Creates random initial data for the 'health' container.
 *
 * Ambulances are randomly assigned to hospitals.
 * @param sim {object} object to which inject the random initial state
 * @param HOSPITALS_NUM {number} how many hospitals to create for the initial state
 * @param AMBULANCE_NUM {number} how many ambulances to create for the initial state
 * @return {*}
 */
export function createSimulation(sim, HOSPITALS_NUM = 4, AMBULANCE_NUM = 12) {
  sim.hospitals = {}
  sim.ambulances = {}
  for (let i = 0; i < HOSPITALS_NUM; i++) {
    let hospital = Hospital.make(i, Random.string(8,30), Random.string(10,50), [], Random.float(48,51), Random.float(12,18))
    sim.hospitals[i] = hospital
  }
  for (let i = 0; i < AMBULANCE_NUM; i++) {
    const hospital = Random.int(0, HOSPITALS_NUM)
    let ambulance = Ambulance.make(i, Random.string(8,30), Random.float(48,51), Random.float(12,18), hospital)
    sim.hospitals[hospital].ambulances.push(i)
    sim.ambulances[i] = ambulance
  }
  return sim;
}

const POLICE_TYPE = ['state', 'city', 'swat']

/**
 * Creates random initial data for the 'police' container.
 *
 * Police cars are randomly assigned to police stations.
 * @param sim {object} object to which inject the random initial state
 * @param STATIONS_NUM {number} how many police stations to create for the initial state
 * @param CARS_NUM {number} how many police vehicles to create for the initial state
 * @return {*}
 */
export function createSimulationPolice(sim, STATIONS_NUM = 4, CARS_NUM = 12) {
  sim.stations = {}
  sim.cars = {}
  for (let i = 0; i < STATIONS_NUM; i++) {
    let station = Station.make(i, Random.string(8,30), Random.string(10,50), [], Random.float(48,51), Random.float(12,18))
    sim.stations[i] = station
  }
  for (let i = 0; i < CARS_NUM; i++) {
    const station = Random.int(0, STATIONS_NUM)
    let car = Car.make(i, Random.string(8,30), POLICE_TYPE[Random.int(0,3)], Random.float(48,51), Random.float(12,18), station)
    sim.stations[station].cars.push(i)
    sim.cars[i] = car
  }
  return sim;
}
