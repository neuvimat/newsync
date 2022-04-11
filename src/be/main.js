import createServer from './createServer'
import {makeSimpleRecursiveProxy} from "@Lib/shared/SimpleProxy";
import {clear} from "@Lib/objUtil";
import {WebRTCHandler} from "./webrtcHandler";
import {createSimulation} from "./model/CreateSimulation";
import {NeuSyncServer} from "@Lib/server/NeuSyncServer";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";

import 'source-map-support/register'

const commType = 0

// Create the server and socket.io
const [server, io, wss] = createServer(8080); // Express and socket.io boilerplate

// ON (BUFFER, false?)
// ON MESSAGE (MESSAGE EVENT, )

const neuSync = new NeuSyncServer(new WebSocketDriverServer('$'), new MessagePackCoder())
const container = neuSync.addContainer('mySuperContainer', new SimpleContainer())
neuSync.enableAutoSync()

wss.on('connection', (socket, request) => {
  const client = neuSync.addClient(socket)
  neuSync.fullUpdate(client)
  socket.on('message', (message, isBinary) => {
    if (isBinary && neuSync.handleIfFrameworkMessage(message)) {return}
    // My Code
    console.log('Not a NeySync message:', message.toString());
  })
  socket.on('close', () => {
    neuSync.removeClient(socket)
  })
  socket.on('error', (error) => {
    neuSync.removeClient(socket)
  })
})

//
createSimulation(container.proxy, 4, 12)
// when user connects
container.proxy.randomData = {}
setInterval(() => { container.proxy.randomData.a = Math.random() }, 5000)

// Create the handler that does all the hard work
// const rtc = new WebRTCHandler(io, sim, pristine, changes, 1000, {HOSPITALS_NUM: 4, AMBULANCE_NUM: 12})

// Start the server
server.listen(8080);
