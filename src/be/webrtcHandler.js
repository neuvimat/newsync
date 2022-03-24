import rtc from "wrtc";
import rtcConfig from './webrtcConfig'
import * as objUtil from "../../lib/objUtil";
import {Ambulance} from "./model/ambulance";
import {Random} from "../../lib/random";

/**
 * Takes care of the WebRTC connection and also handles the simulation, synchronization and user commands
 */
export class WebRTCHandler {
  constructor(io, sim, pristineSim, changes, broadcastPeriod = 1000, config) {
    this.io = io; // socket.io
    this.sim = sim;
    this.changes = changes
    this.pristineSim = pristineSim
    this.peers = {}
    this.openChannels = {}
    this.prepareIoAndRTC()
    this.config = config

    this.movingAmbulances = [0] // Start with one moving ambulance

    setInterval(() => {this.broadcast()}, broadcastPeriod) // Sync the state every second
  }

  /**
   * Handles client messages. Clients can send an object that has all the data that should be changed on the server or
   * a string prepended with exclamation mark that represents a specific command
   */
  handleClientCommand(msg) {
    console.log(msg);
    if (msg[0] === '!') {
      const split = msg.substr(1, msg.length - 1).split(' ')
      const cmd = split[0]
      const params = split.slice(1)
      switch (cmd) {
        // Add one specific ambulance to moving state
        case 'move':
          if (params[0]) {this.movingAmbulances.push(Number(params[0]))}
          break;
        // Stop all ambulances and move those in range
        case 'moverange':
          const from = Number(params[0])
          const to = Number(params[1])
          this.movingAmbulances = []
          for (let i = from; i < to; i++) {
            this.movingAmbulances.push(i)
          }
          break;
        // Make all ambulances move
        case 'moveall':
          this.movingAmbulances = []
          for (let i = 0; i < this.config.AMBULANCE_NUM; i++) {
            this.movingAmbulances.push(i)
          }
          break;
        // Stop all ambulances
        case 'stopall':
          this.movingAmbulances = []
            break;
        default:
          console.error(`Unknown command received: ${cmd}`);
      }
    }
    // Else we received a diff object from user, apply it
    else {
      const obj = JSON.parse(msg)
      objUtil.merge(this.sim, obj)
    }
  }

  /**
   * Creates some changes in the simulation
   */
  simulate() {
    for (let id of this.movingAmbulances) {
      Ambulance.moveAmbulance(this.sim.ambulances[id])
    }
    for (let i = 0; i < Random.int(0,6); i++) {
      if (Math.random() > Math.random() + .4) {
        this.sim.hospitals[Random.int(0, this.config.HOSPITALS_NUM)].name = Random.string(8, 30)
      }
    }
    for (let i = 0; i < Random.int(0,6); i++) {
      if (Math.random() > Math.random() + .4) {
        this.sim.hospitals[Random.int(0, this.config.HOSPITALS_NUM)].address = Random.string(8, 30)
      }
    }
  }

  /**
   * Send the new complete state and delta update to all connected users
   */
  broadcast() {
    this.simulate()
    for (let channel in this.openChannels) {
      this.openChannels[channel].send(JSON.stringify([this.sim, this.changes]))
    }
    objUtil.clear(this.changes)
  }

  /**
   * Setups all the socket.io events and how to handle them
   * Takes care of connecting and disconnecting clients
   * Sets up the RTC connection based on the messages going through socket.io
   *
   * We send both the full and delta messages inside one channel in one message
   * They are bundled inside an array. At index 0 is the 'full' channel, index 1 has the delta channel
   */
  prepareIoAndRTC() {
    const io = this.io
    const peers = this.peers
    const channels = this.openChannels

    io.sockets.on("connection", socket => {
      // Received from client when they were served the app and are ready to connect via WebRTC
      socket.on("client", () => {
        const id = socket.id
        const peerConnection = new rtc.RTCPeerConnection(rtcConfig);
        peers[id] = peerConnection;

        const dc = peerConnection.createDataChannel('testChannel')
        dc.onopen = ev => {
          channels[id] = dc
          // Even with deltas, when the connection is first established we send full state
          // [periodic messages of new state are handled in this.broadcast() method]
          dc.send(JSON.stringify([this.sim, this.sim]))
        }
        dc.onmessage = msg => {
          this.handleClientCommand(msg.data)
        }

        // When the STUN finds a possible route to reach us, forward it to the other side
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
          }
        };

        // Create an offer and forward it to the other side
        peerConnection
          .createOffer()
          .then(sdp => {
            peerConnection.setLocalDescription(sdp)
          })
          .then(() => {
            socket.emit("offer", id, peerConnection.localDescription);
          });
      });

      // When the other (client) side disconnected
      socket.on("disconnect", () => {
        peers[socket.id].close()
        delete peers[socket.id]
        delete channels[socket.id]
      });

      // Client received our offer and responded with information about themselves
      socket.on("answer", (id, description) => {
        peers[id].setRemoteDescription(description);
      });

      // Client sent a candidate path how we can reach them
      socket.on("candidate", (id, candidate) => {
        if (candidate.candidate && candidate.candidate !== '')
          peers[id].addIceCandidate(new rtc.RTCIceCandidate(candidate));
      });
    });

    io.on('connection', (socket) => {
      console.log('New client has connected!');
    });
  }
}
