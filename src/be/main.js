import 'source-map-support/register'
import createServer from './createServer'
import {Simulation} from "../fe/ClientState";
import {makeRecursiveProxy} from "../../lib/proxymaker";
import {Hospital} from "./model/hospital";
import {Random} from "../../lib/random";
import {Ambulance} from "./model/ambulance";
import 'source-map-support/register'
import {clear} from "../../lib/objUtil";
import {WebRTCHandler} from "./webrtcHandler";

// Create the server and socket.io
const [server,io] = createServer(8080); // Express and socket.io boilerplate

// Prepare the simulation
const HOSPITALS_NUM = 190;
const AMBULANCE_NUM = 950; // 5 ambulances per hospital

let {pristine, proxy: sim, changes} = makeRecursiveProxy()
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
clear(changes) // The preparation of data was considered a change, we do not want that, as we send the whole state when user connects

// Create the handler that does all the hard work
const rtc = new WebRTCHandler(io, sim, pristine, changes, 1000, {HOSPITALS_NUM, AMBULANCE_NUM})

// Start the server
server.listen(8080);
