import createServer from './createServer'
import {makeSimpleRecursiveProxy} from "@Lib/shared/SimpleProxy";
import {clear} from "@Lib/objUtil";
import {WebRTCHandler} from "./webrtcHandler";
import {createSimulation} from "./model/CreateSimulation";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";

import 'source-map-support/register'

const commType = 0

// Create the server and socket.io
const [server, io, wss] = createServer(8080); // Express and socket.io boilerplate


const newSync = new NewSyncServer(new WebSocketDriverServer('$'), new MessagePackCoder())
const container = newSync.addContainer('mySuperContainer', new SimpleContainer())
newSync.enableAutoSync()

wss.on('connection', (socket, request) => {
  const client = newSync.addClient(socket)
  newSync.fullUpdate(client)
  socket.on('message', (message, isBinary) => {
    if (isBinary && newSync.handleIfFrameworkMessage(message)) {return}
    // My Code
    console.log('Not a NeySync message:', message.toString());
  })
  socket.on('close', () => {
    newSync.removeClient(socket)
  })
  socket.on('error', (error) => {
    newSync.removeClient(socket)
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
