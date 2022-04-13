// noinspection DuplicatedCode

import createServer from './createServer'
import rtc from "wrtc";
import rtcConfig from './webrtcConfig'
import {proxyKey} from "@Lib/shared/SimpleProxy";

import {createSimulation} from "./model/CreateSimulation";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";

import 'source-map-support/register'
import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {SocketIOSignallerServer} from "@Lib/server/signallers/SocketIOSignallerServer";
import {clear} from "@Lib/objUtil";
import {RtcDriverServer} from "@Lib/server/drivers/RtcDriverServer";

const commType = 0

// Create the server and socket.io
const [server, io, wss] = createServer(8080); // Express and socket.io boilerplate
/** @type {NewSyncServer} **/
let newSync = null

// =============================
// ============= WebSocket SETUP
// =============================
// newSync = new NewSyncServer(new WebSocketDriverServer('$'), new MessagePackCoder(), new LongKeyDictionaryServer())
//
// wss.on('connection', (socket, request) => {
//   const client = newSync.addClient(socket)
//   newSync.fullUpdate(client)
//   socket.on('message', (message, isBinary) => {
//     if (isBinary && newSync.handleIfFrameworkMessage(message)) {return}
//     console.log('Not a NewSync message, run your own code here:', message.toString());
//   })
//
//   socket.on('close', () => {
//     newSync.removeClient(socket)
//   })
//
//   socket.on('error', (error) => {
//     newSync.removeClient(socket)
//   })
// })

// =============================
// ============= WRTC SETUP
// =============================
newSync = new NewSyncServer(new RtcDriverServer(), new MessagePackCoder(), new LongKeyDictionaryServer())

io.on('connection', (socket)=>{
  let peerConnection = new rtc.RTCPeerConnection(rtcConfig)
  const dc = peerConnection.createDataChannel('NewSync', {})

  dc.onopen = ev => {
    const client = newSync.addClient(peerConnection, dc)
    console.log('sent full update');
    newSync.fullUpdate(client)
    newSync.driver.sendToAllLowPrio()
  }
  dc.onmessage = msg => {
    console.log('Received data from client, hanxdling');
    // newSync.handleIfFrameworkMessage(msg)
  }

  // When the STUN finds a possible route to reach us, forward it to the other side
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", event.candidate);
    }
  };

  // Create an offer and forward it to the other side
  peerConnection
    .createOffer()
    .then(sdp => {
      peerConnection.setLocalDescription(sdp)
    })
    .then(() => {
      console.log('sending offer');
      socket.emit("offer", peerConnection.localDescription);
    });

  // When the other (client) side disconnected from the socket IO
  socket.on("disconnect", () => {
    // newSync.removeClient(dc, rtcPeer)
  });

  // Client received our offer and responded with information about themselves
  socket.on("answer", (description) => {
    peerConnection.setRemoteDescription(description);
  });

  // Client sent a candidate path on how we can reach them
  socket.on("candidate", (candidate) => {
    if (candidate.candidate && candidate.candidate !== '') {
      peerConnection.addIceCandidate(new rtc.RTCIceCandidate(candidate));
    }
    else {
    }
  });
})

const container = newSync.addContainer('mySuperContainer', new SimpleContainer())
newSync.enableAutoSync()

createSimulation(container.proxy, 4, 12)
container.proxy.randomData = {a: 0}
setInterval(() => {
  container.proxy.randomData.$low.set('lowPrioKey', Math.random()).getLowPrioChanges()
}, 1500)
setInterval(() => {
  container.proxy.randomData.a++
}, 1800)

// Start the server
server.listen(8080);
