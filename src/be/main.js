// noinspection DuplicatedCode

import createServer from './createServer'
import rtc from "wrtc";
import rtcConfig from './webrtcConfig'
import {proxyKey} from "@Lib/shared/SimpleProxy";

import {createSimulation} from "./model/CreateSimulation";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";

import 'source-map-support/register'
import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {RtcDriverServer} from "@Lib/server/drivers/RtcDriverServer";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {Ambulance} from "@/be/model/ambulance";

const commType = 1 // useless

// Create the server and socket.io
const [server, io, wss] = createServer(8080); // Express and socket.io boilerplate
/** @type {NewSyncServer} **/
let newSync = null

// =============================
// ============= WebSocket SETUP
// =============================
newSync = new NewSyncServer(new WebSocketDriverServer(''), new MessagePackCoder(), new LongKeyDictionaryServer())

wss.on('connection', (socket, request) => {
  const client = newSync.addClient(socket)
  // newSync.fullUpdate(client)

  socket.on('message', (message, isBinary) => {
    if (isBinary && newSync.handleIfFrameworkMessage(message, client)) {return}
    console.log('Not a NewSync message, run your own code here:', message.toString());
  })

  socket.on('close', () => {
    newSync.removeClient(client)
  })


  socket.on('error', (error) => {
    newSync.removeClient(client)
  })
})

// =============================
// ============= WRTC SETUP
// =============================

/*
newSync = new NewSyncServer(new RtcDriverServer(), new MessagePackCoder(), new LongKeyDictionaryServer())

io.on('connection', (socket) => {
  let peerConnection = new rtc.RTCPeerConnection(rtcConfig)
  const dc = peerConnection.createDataChannel('NewSync', {})
  let client = null

  dc.onopen = ev => {
    client = newSync.addClient(peerConnection, dc)
    newSync.on('custom2', (a, b, c) => {
      console.log('Received event custom2', a, b, c);
    })
    newSync.setCustomMessageHandler((message) => {
      console.log('Handling a custom message in any way client deems worth', message);
    })
  }
  dc.onmessage = msg => {
    newSync.handleIfFrameworkMessage(msg.data, client)
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
      socket.emit("offer", peerConnection.localDescription);
    });

  // When the other (client) side disconnected from the socket IO
  socket.on("disconnect", () => {
    newSync.removeClient(client)
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

*/

const container = newSync.addContainer('health', new SimpleContainer())
newSync.enableAutoSync()

createSimulation(container.proxy, 4, 12)
container.proxy.randomData = {a: 0}
// setInterval(() => {
//   container.proxy.randomData.$low.set('low prio attribute', Math.random()).getLowPrioChanges()
// }, 1500)
setInterval(() => {
  // container.proxy.randomData.a++
  for (let i = 0; i < 12; i++) {
    Ambulance.moveAmbulance(container.proxy.ambulances[i])
  }
}, 1800)

// Start the server
server.listen(8080);
