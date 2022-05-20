import {LongKeyDictionaryServer} from "@Lib/server/LongKeyDictionaryServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {ObjectContainer} from "@Lib/shared/container/ObjectContainer";
import {HealthSimulationRunner} from "@/be/simulation/SimulationRunner";
import {PoliceSimulationRunner} from "@/be/simulation/PoliceSimulationRunner";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {RtcDriverServer} from "@Lib/server/drivers/RtcDriverServer";
import {clear, isEmpty} from "@Lib/util/objUtil";
import {promises} from 'fs'
import 'source-map-support/register'

// =========== TEST CONFIG
const EXECUTIONS = 11
const ITERATIONS = 100
const MOVING_AMBULANCES = 600
// =========== TEST CONFIG

let resultsTotal = []
let resultsDelta = []
let resultsPacks = []

let localResultsTotal = []
let localResultsDelta = []
let localResultsPacks = []

const newSync = new NewSyncServer(new RtcDriverServer(), new MessagePackCoder(), new LongKeyDictionaryServer())

const container = newSync.addContainer('health', new ObjectContainer())
const police = newSync.addContainer('police', new ObjectContainer())

const ambulanceRunner = new HealthSimulationRunner(container.proxy, 100, 600)
const policeRunner = new PoliceSimulationRunner(police.proxy, 8, 125)

// Disable the 'welcome' message send to clients when added
newSync.welcome = () => {}

// Add dummy client
const c = newSync.addClient()
c.whitelistContainer('health')

for (let i = 0; i < MOVING_AMBULANCES; i++) {
  ambulanceRunner.moveAmbulanceRandom(i)
}

for (let i = 0; i < EXECUTIONS; i++) {
  doTest()
}

function doTest() {
  localResultsTotal = []
  localResultsDelta = []
  localResultsPacks = []

  const start = performance.now()

  for (let j = 0; j < ITERATIONS; j++) {
    simulateIteration()
  }

  const duration = performance.now() - start

  resultsTotal = resultsTotal.concat([localResultsTotal])
  resultsDelta = resultsDelta.concat([localResultsDelta])
  resultsPacks = resultsPacks.concat([localResultsPacks])

  console.log(`Duration: ${duration} ms`);
}

function simulateIteration() {
  const t1 = performance.now()
  ambulanceRunner.iterate()
  policeRunner.iterate()

  const client = newSync.clients['1']
  const t2 = performance.now()
  const message = newSync.getSynchronizationMessage(client)
  const data = newSync.coder.pack(message)
  const t3 = performance.now()

  for (let k in newSync.containers) {
    newSync.containers[k].clear()
  }
  clear(newSync.dict.changes)
  newSync.clearContainerCache()
  newSync.clearFullContainerCache()
  newSync.clearGlobal()
  const t4 = performance.now()

  localResultsTotal.push(t4-t1)
  localResultsPacks.push(t3-t2)
  localResultsDelta.push(t2-t1)
}

// Create the text file

let string = ''
let tmp = []

string += 'Deltas:\n'
for (let i = 0; i < EXECUTIONS; i++) {
  tmp.push(resultsDelta[i].reduce((a,b)=>{return a+b},0))
}
string += tmp.join(',') + '\n\n'

string += 'Packs:\n'
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

promises.writeFile(`NS_${MOVING_AMBULANCES}.txt`, string)
