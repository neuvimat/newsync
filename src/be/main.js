import 'source-map-support/register'
import createServer from './createServer'
import {makeRecursiveProxy} from "../../lib/proxymaker";
import 'source-map-support/register'
import {clear} from "../../lib/objUtil";
import {WebRTCHandler} from "./webrtcHandler";
import {createSimulation} from "./model/CreateSimulation";
import {NeuSyncServer} from "../../lib/server/NeuSyncServer";

const commType = 0

// Create the server and socket.io
const [server,io] = createServer(8080); // Express and socket.io boilerplate


let {pristine, proxy: sim, changes} = makeRecursiveProxy()
createSimulation(sim, 4, 12)
clear(changes) // The preparation of data was considered a change, we do not want that, as we send the whole state when user connects

// const NeuSync = new NeuSyncServer()

// Create the handler that does all the hard work
const rtc = new WebRTCHandler(io, sim, pristine, changes, 1000, {HOSPITALS_NUM: 4, AMBULANCE_NUM: 12})

// Start the server
server.listen(8080);
