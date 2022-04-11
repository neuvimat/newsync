const DEFAULT_CONFIG = {iceServers: [{urls: ["stun:stun.l.google.com:19302"]}]};

export class WebRtcDriver {
  constructor() {
    this.peerConnection = null
    this.signalDriver = null
    this.prefix = '`' // todo: prefix in specific drive or for the whole server?
    this.newSyncInstance = null // server or client
  }

  async setUpFromScratch(config = DEFAULT_CONFIG) {
    const description = await this.signalDriver.getOfferDescription()
    this.peerConnection = new RTCPeerConnection(DEFAULT_CONFIG);
    this.peerConnection
      .setRemoteDescription(description)
      .then(() => this.peerConnection.createAnswer())
      .then(sdp => this.peerConnection.setLocalDescription(sdp))
      .then(() => {
        // this.signalDriver.emit("answer", id, peerConnection.localDescription);
        this.signalDriver.answerRtc("answer");
      });

    this.peerConnection.ondatachannel = event => {
      if (true) {
        console.log('WebRTC channel opened!');
        ui.setRtcChannel(event.channel)
        clientState.setRtcChannel(event.channel)
        event.channel.onmessage = (msg) => {
          receiver.handleMessage(JSON.parse(msg.data))
        }
      }
      else if(this.peerConnection._userondatachannel) {
        this.peerConnection._userondatachannel(event)
      }
    };

    // When we get a possible way from us to the server, tell them
    this.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };

    const wrapper = {}
    const self = this
    for (let k in this.peerConnection) {
      if (k === 'ondatachannel') {
        wrapper[k] = Object.defineProperty(wrapper, k, {
          set: (v) => {this.peerConnection['_userondatachannel'] = v}, get: () => {return this.peerConnection['_userondatachannel']}
        })
      }
      else {
        wrapper[k] = Object.defineProperty(wrapper, k, {
          set: (v) => {this.peerConnection[k] = v}, get: () => {return this.peerConnection[k]}
        })
      }
    }
  }

  /**
   * @param {RTCPeerConnection} wrtcConnection
   */
  injectToExistingConnection(wrtcConnection) {
    const oldFn = wrtcConnection.ondatachannel
    wrtcConnection.ondatachannel = (event) => {
      if (event.channel.label[0] === this.prefix) {
        console.log('WebRTC channel opened!');
        event.channel.onmessage = (msg) => {
          console.log(msg);
        }
      }
      else {
        oldFn(event)
      }
    }
  }
}

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

