import {Hospital} from "./hospital";
import {Random} from "../../../lib/random";
import {Ambulance} from "./ambulance";
import {Car} from "@/be/model/car";
import {Station} from "@/be/model/station";

export function createSimulation(sim, HOSPITALS_NUM = 4, AMBULANCE_NUM = 12) {
  sim.hospitals = {}
  sim.ambulances = {}
  for (let i = 0; i < HOSPITALS_NUM; i++) {
    let h = Hospital.make(i, Random.string(8,30), Random.string(10,50), [], Random.float(48,51), Random.float(12,18))
    sim.hospitals[i] = h
  }
  for (let i = 0; i < AMBULANCE_NUM; i++) {
    const hospital = Random.int(0, HOSPITALS_NUM)
    let a = Ambulance.make(i, Random.string(8,30), Random.float(48,51), Random.float(12,18), hospital)
    sim.hospitals[hospital].ambulances.push(i)
    sim.ambulances[i] = a
  }
  return sim;
}

const POLICE_TYPE = ['state', 'city', 'swat']

export function createSimulationPolice(sim, STATIONS_NUM = 4, CARS_NUM = 12) {
  sim.stations = {}
  sim.cars = {}
  for (let i = 0; i < STATIONS_NUM; i++) {
    let s = Station.make(i, Random.string(8,30), Random.string(10,50), [], Random.float(48,51), Random.float(12,18))
    sim.stations[i] = s
  }
  for (let i = 0; i < CARS_NUM; i++) {
    const station = Random.int(0, STATIONS_NUM)
    let c = Car.make(i, Random.string(8,30), POLICE_TYPE[Random.int(0,3)], Random.float(48,51), Random.float(12,18), station)
    sim.stations[station].cars.push(i)
    sim.cars[i] = c
  }
  return sim;
}
