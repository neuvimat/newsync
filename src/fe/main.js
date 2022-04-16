import {pack, Packr, unpack, Unpackr} from "msgpackr";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {NewSyncClient} from "@Lib/client/NewSyncClient";
import rtcConfig from '../be/webrtcConfig'
import {RtcDriverClient} from "@Lib/client/drivers/RtcDriverClient";
import {KEYWORDS_TO} from "@Lib/shared/SYMBOLS";

let h1 = document.createElement('h1');
h1.innerHTML = 'Current state'
let h2 = document.createElement('h1');
h2.innerHTML = 'Changes state'
let div = document.createElement('div');
let changes = document.createElement('changes');
document.body.appendChild(h1)
document.body.appendChild(div)
document.body.appendChild(h2)
document.body.appendChild(changes)

let newSyncClient = null

// =============================
// ============= WEBSOCKET SETUP
// =============================
// const ws = new WebSocket('ws://localhost:8080/');
// ws.binaryType = "arraybuffer"
// newSyncClient = new NewSyncClient(new WebSocketDriverClient('$'), new MessagePackCoder())
//
// ws.onopen = (event) =>{
//   console.log(event);
// }
// ws.onmessage = (message)=>{
//   if (newSyncClient.handleIfFrameworkMessage(message.data)) {return}
//   console.log('Not a framework message, your code here:');
// }

// =============================
// ============= WRTC SETUP
// =============================
const socket = io(); // Start connecting immediately; we use socket io as signalling server
newSyncClient = new NewSyncClient(new RtcDriverClient(), new MessagePackCoder())

socket.on("connect", () => {
  // Do nothing, sever will automatically respond by sending and RTC offer
  console.log('IO connected');
});

let peerConnection = null; // 'Smuggle' the reference out of socket.io scope

// When we get the required info (offer) to establish WebRTC connection
socket.on("offer", (description) => {
  peerConnection = new RTCPeerConnection(rtcConfig);

  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      // Send the server information about us
      socket.emit("answer", peerConnection.localDescription);
    });

  peerConnection.ondatachannel = event => {
    console.log('New channel made with label', event.channel.label);
    if (event.channel.label === 'NewSyncLowPrio') {
      event.channel.send('x')
    }
    event.channel.binaryType = 'arraybuffer'
    event.channel.onmessage = (msg) => {
      newSyncClient.handleIfFrameworkMessage(msg.data)
    }
  };

  // When we get a possible way from us to the server, tell them
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", event.candidate);
    }
  };
});

// Server responded with possible way of reaching them
socket.on("candidate", (candidate) => {
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

newSyncClient.addEventListener('sync', (event)=>{
  div.innerHTML = JSON.stringify(event.state)
  changes.innerHTML = JSON.stringify(event.changes)
})
newSyncClient.addEventListener('syncLowPrio', (event)=>{
  console.log('low prio message:', event);
})

// ArrayProxy()
