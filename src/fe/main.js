import {pack, Packr, unpack, Unpackr} from "msgpackr";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {NewSyncClient} from "@Lib/client/NewSyncClient";
import rtcConfig from '../be/webrtcConfig'
import {RtcDriverClient} from "@Lib/client/drivers/RtcDriverClient";
import {KEYWORDS} from "@Lib/shared/SYMBOLS";
import {COMMANDS} from "@Lib/shared/COMMANDS";

let h1 = document.createElement('h1');
h1.innerHTML = 'Current state'
let h2 = document.createElement('h1');
h2.innerHTML = 'Changes state'
let h3 = document.createElement('h1');
h3.innerHTML = 'Last message (raw)'
let h4 = document.createElement('h1');
h4.innerHTML = 'Last message'
let div = document.createElement('div');
let changes = document.createElement('div');
let messageRaw = document.createElement('div');
let message = document.createElement('div');
document.body.appendChild(h1)
document.body.appendChild(div)
document.body.appendChild(h2)
document.body.appendChild(changes)
document.body.appendChild(h3)
document.body.appendChild(messageRaw)
document.body.appendChild(h4)
document.body.appendChild(message)

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
      event.channel.send('x') // ping the server that the channel is open due to wrtc node.js bug
    }
    else if (event.channel.label === 'NewSync') {
      newSyncClient.setConnection(peerConnection, event.channel)
      newSyncClient.send({[KEYWORDS.commands]: [COMMANDS.SUBSCRIBE_ALL]})
      setTimeout(()=>{newSyncClient.send({[KEYWORDS.events]: [['custom2', [1,2],3]]})}, 2000)
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
  changes.innerHTML = JSON.stringify(event.containers)
  messageRaw.innerHTML = JSON.stringify(event.message)
  message.innerHTML = JSON.stringify(event.containers)
})
newSyncClient.addEventListener('syncLowPrio', (event)=>{
  console.log('low prio message:', event);
})

// const main = {}
// const a = {a: 40, b: 15, c:'lolec'}
// const b = {xasd: 'adaw', asddas: 9999, ugnaikg: 'asdniasdn'}
// main.a = a
// main.b = b
// const mainP = pack(main)
// const mainN = pack({a: pack(a), b: pack(b)})
// console.log(mainP.length)
// console.log(mainN.length);
// console.log(unpack(mainP));
// console.log(unpack(mainN));


// ArrayProxy()
