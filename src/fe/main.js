import {UI} from "./UI";
import {Receiver} from "./receiver";
import {makeRecursiveProxy} from "../../lib/proxymaker";
import * as objUtils from '../../lib/objUtil'
import {Random} from "../../lib/random";
import {ClientState} from "./ClientState";

// Entry point of the client app

// WebRTC config
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

const {pristine, proxy, changes} = makeRecursiveProxy() // Create the automatic state detector
const clientState = new ClientState(pristine, proxy, changes) // Manager of local state
const ui = new UI() // UI rendering methods
const receiver = new Receiver(ui, clientState); // WebRTC message handler

// Allow the user to tamper with his local state via the UI prompt and allow some debugging via console
// Expose the state as 'sim'
window.sim = proxy
window.pristine = pristine
window.ui = new UI()
window.receiver = receiver
window.state = clientState

// Setup WebRTC via socket.io
const socket = io.connect(window.location.origin); // Start connecting immediately

// When we connect, ping the server, it will answer with offer (required info) for WebRTC connection
socket.on("connect", (id) => {
  socket.emit("client");
});

let peerConnection = null; // 'Smuggle' the reference out of socket.io scope

// When we get the required info (offer) to establish WebRTC connection
socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      // Send the server information about us
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ondatachannel = event => {
    console.log('WebRTC channel opened!');
    ui.setRtcChannel(event.channel)
    clientState.setRtcChannel(event.channel)
    event.channel.onmessage = (msg) => {
      receiver.handleMessage(JSON.parse(msg.data))
    }
  };
  // When we get a possible way from us to the server, tell them
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});

// Server responded with possible way of reaching them
socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

// Graceful shutdown
window.onunload = window.onbeforeunload = () => {
  if (peerConnection) {
    peerConnection.close();
  }
  socket.close();
};
