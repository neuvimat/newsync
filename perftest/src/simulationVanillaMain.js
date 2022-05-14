import {SimulationRunner} from "@/be/simulation/SimulationRunner";
import {PoliceSimulationRunner} from "@/be/simulation/PoliceSimulationRunner";
import * as t from '../lib/Library.mjs'
import 'source-map-support/register'
import {promises} from "fs";

// =========== TEST CONFIG
const EXECUTIONS = 11
const ITERATIONS = 10
const MOVING_AMBULANCES = 600
// =========== TEST CONFIG

let resultsTotal = []
let resultsDelta = []
let resultsPacks = []

let localResultsTotal = []
let localResultsDelta = []
let localResultsPacks = []

const ambulanceState = {}
const policeState = {}

const ambulanceRunner = new SimulationRunner(ambulanceState, 100, 600)
const policeRunner = new PoliceSimulationRunner(policeState, 8, 125)

for (let i = 0; i < MOVING_AMBULANCES; i++) {
  ambulanceRunner.moveAmbulanceRandom(i)
}

for (let i = 0; i < EXECUTIONS; i++) {
  doTest()
}

function doTest() {
  const start = performance.now()

  localResultsTotal = []
  localResultsDelta = []
  localResultsPacks = []
  for (let j = 0; j < ITERATIONS; j++) {
    simulateIteration()
  }
  resultsTotal = resultsTotal.concat([localResultsTotal])
  resultsDelta = resultsDelta.concat([localResultsDelta])
  resultsPacks = resultsPacks.concat([localResultsPacks])

  const duration = performance.now() - start
  console.log(`Duration: ${duration} ms`);
}

function simulateIteration() {
  const t1 = performance.now()
  ambulanceRunner.iterate()
  policeRunner.iterate()
  const t2 = performance.now()

  const fullStateJson = JSON.stringify({ambulanceState, policeState})
  const t3 = performance.now()
  localResultsTotal.push(t3 - t1)
  localResultsDelta.push(t2 - t1)
  localResultsPacks.push(t3 - t2)
  fullStateJson
}

let string = ''
let tmp = []

string += 'Deltas:\n'
for (let i = 0; i < EXECUTIONS; i++) {
  tmp.push(resultsDelta[i].reduce((a,b)=>{return a+b},0))
}
string += tmp.join(',') + '\n'

string += 'Packs:\n\n'
tmp = []
for (let i = 0; i < EXECUTIONS; i++) {
  tmp.push(resultsPacks[i].reduce((a,b)=>{return a+b},0))
}
string += tmp.join(',') + '\n\n'

string += 'Totals:\n'
tmp = []
for (let i = 0; i < EXECUTIONS; i++) {
  tmp.push(resultsDelta[i].reduce((a,b)=>{return a+b},0) + resultsPacks[i].reduce((a,b)=>{return a+b},0))
}
string += tmp.join(',') + '\n\n'

promises.writeFile(`V_${MOVING_AMBULANCES}.txt`, string)
