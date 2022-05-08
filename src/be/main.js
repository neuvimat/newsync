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
import {SimulationRunner} from "@/be/simulation/SimulationRunner";
import {PoliceSimulationRunner} from "@/be/simulation/PoliceSimulationRunner";
import {ObjectContainer} from "@Lib/shared/containers/ObjectContainer";

const port = Number(process.argv[2]) || 8080
const commType = Number(process.argv[3]) || 2

// Create the server and socket.io
const [server, io, wss] = createServer(port); // Express and socket.io boilerplate
/** @type {NewSyncServer} **/
let newSync = null
const dict = new LongKeyDictionaryServer()
const coder = new MessagePackCoder()


// =============================
// ============= WebSocket SETUP
// =============================
if (commType === 1) {
  newSync = new NewSyncServer(new WebSocketDriverServer(''), coder, dict)

  wss.on('connection', (socket, request) => {
    const client = newSync.addClient(socket)
    // newSync.fullUpdate(client)

    socket.on('message', (message, isBinary) => {
      if (isBinary && newSync.handleIfFrameworkMessage(message, client)) {return}
      console.log('Received a non-NewSync message, run your own code here:', message.toString());
    })

    socket.on('close', () => {
      newSync.removeClient(client)
    })


    socket.on('error', (error) => {
      newSync.removeClient(client)
    })
  })
}

// =============================
// ============= WRTC SETUP
// =============================
if (commType === 2) {
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
}

const container = newSync.addContainer('health', new ObjectContainer())
const police = newSync.addContainer('police', new ObjectContainer())

newSync.enableAutoSync()
const ambulanceRunner = new SimulationRunner(container.proxy, 100, 600)
const policeRunner = new PoliceSimulationRunner(police.proxy, 8, 125)

newSync.on('sendAmbulance', (client, id, lon, lat) => {
  ambulanceRunner.moveAmbulanceTarget(id, [Number(lon), Number(lat)])
})
newSync.on('spasmAmbulance', (client, id) => {
  ambulanceRunner.moveAmbulanceRandom(id)
})
newSync.on('recallAmbulance', (client, id) => {
  ambulanceRunner.recallAmbulance(id)
})
newSync.on('moveAmbulances', (client, quantity) => {
  ambulanceRunner.moveQuantity(Number(quantity))
})
newSync.on('stop', (client, id) => {
  ambulanceRunner.stop(id)
})
newSync.on('stopAll', (client) => {
  ambulanceRunner.stopAll()
})

newSync.on('sendCar', (client, id, lon, lat) => {
  policeRunner.moveCarTarget(id, [Number(lon), Number(lat)])
})
newSync.on('spasmCar', (client, id) => {
  policeRunner.moveCarRandom(id)
})
newSync.on('recallCar', (client, id) => {
  policeRunner.recallCar(id)
})
newSync.on('moveCars', (client, quantity) => {
  policeRunner.moveQuantity(Number(quantity))
})
newSync.on('stopCar', (client, id) => {
  policeRunner.stop(id)
})
newSync.on('stopAllCars', (client) => {
  policeRunner.stopAll()
})

setInterval(() => {
  ambulanceRunner.iterate()
  policeRunner.iterate()
}, 333)

// Start the server
server.listen(8080);
