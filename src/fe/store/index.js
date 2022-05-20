import Vue from 'vue'
import Vuex from 'vuex'
import {NewSyncClient} from "@Lib/client/NewSyncClient";
import {WebSocketDriverClient} from "@Lib/client/drivers/WebSocketDriverClient";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {LongKeyDictionaryClient} from "@Lib/client/LongKeyDictionaryClient";
import {ALIAS} from "@Lib/shared/ALIAS";
import {MessageInfoModel} from "@/fe/models/MessageInfoModel";
import {INDICES} from "@Lib/shared/SYMBOLS";
import {pack} from 'msgpackr'
import {RtcDriverClient} from "@Lib/client/drivers/RtcDriverClient";
import webrtcConfig from "@/be/webrtcConfig";
import {ObjectContainer} from "@Lib/shared/container/ObjectContainer";

Vue.use(Vuex)

const tEncoder = new TextEncoder()

let ws = null
let ios = null

export default new Vuex.Store({
  state: {
    newSync: null,
    receivedMessages: [],
    containers: {},
    ready: false,

    // Statistics
    messagesReceived: 0,
    lengthFullJson: 0,
    lengthFullMsgpack: 0,
    lengthMsgPack: 0,
    lengthMsgPackNoDict: 0,
    lengthJson: 0,
    lengthJsonNoDict: 0,
  },
  getters: {},
  mutations: {
    random() {}
  },
  actions: {
    sendEvent({state}, payload) {
      state.newSync.sendEvent(payload.event, ...payload.args)
    },
    connectWS({state}, payload) {
      let reject, resolve, promise;
      promise = new Promise((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
      })
      const ns = new NewSyncClient(new WebSocketDriverClient(''), new MessagePackCoder(), new LongKeyDictionaryClient())
      ns.addContainer('health', new ObjectContainer())
      ns.addContainer('police', new ObjectContainer())
      ns.on(ALIAS.EVENT_SYNC, (event) => {
        console.log('event.message', event.message);
        if (event.message[INDICES.meta] || event.message[INDICES.containers] || event.message[INDICES.deletes]) {
          // We received some state update, let's pretend that if NewSync was not used, we would get full update
          const fakeState = {}
          for (const k in event.state) {
            fakeState[k] = event.state[k].pristine
          }
          state.lengthFullJson += tEncoder.encode(JSON.stringify(fakeState)).length
          state.lengthFullMsgpack += pack(fakeState).length
        }
      })
      state.containers = {}

      ns.onmessage = (msg)=>{console.log('msg',msg);}

      Vue.set(state, 'newSync', ns)
      Vue.set(state.containers, 'health', ns.containers.health.pristine)
      Vue.set(state.containers, 'police', ns.containers.police.pristine)

      ws = new WebSocket(payload.url)
      ws.binaryType = "arraybuffer"
      ws.onopen = () => {
        ns.setConnection(ws)
        resolve()
      }
      ws.onclose = () => {
        reject()
      }
      ws.onerror = () => {

      }
      ws.onmessage = (msg) => {
        if (ns.handleIfFrameworkMessage(msg.data)) {
          Vue.set(state.containers, 'health', {...ns.containers.health.pristine})
          Vue.set(state.containers, 'police', {...ns.containers.police.pristine})
          const mi = new MessageInfoModel(msg.data, ns.dict, ++state.messagesReceived, new Date())
          state.receivedMessages.push(mi)
          state.lengthMsgPack += mi.lengthFinal
          state.lengthMsgPackNoDict += mi.lengthNoDict
          state.lengthJson += mi.lengthJsonDict
          state.lengthJsonNoDict += mi.lengthJsonNoDict
        }
      }
      return promise
    },
    connectRtc({state}, {url}) {
      let reject, resolve, promise;
      promise = new Promise((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
      })

      // Prepare the new Sync and Vue frontend
      const ns = new NewSyncClient(new RtcDriverClient(), new MessagePackCoder(), new LongKeyDictionaryClient())
      ns.addContainer('health', new ObjectContainer())
      ns.addContainer('police', new ObjectContainer())
      ns.on(ALIAS.EVENT_SYNC, (event) => {
        console.log('event.message', event.message);
        if (event.message[INDICES.meta] || event.message[INDICES.containers] || event.message[INDICES.deletes]) {
          // We received some state update, let's pretend that if NewSync was not used, we would get full update
          const fakeState = {}
          for (const k in event.state) {
            fakeState[k] = event.state[k].pristine
          }
          state.lengthFullJson += tEncoder.encode(JSON.stringify(fakeState)).length
          state.lengthFullMsgpack += pack(fakeState).length
        }
      })
      state.containers = {}

      Vue.set(state, 'newSync', ns)
      Vue.set(state.containers, 'health', ns.containers.health.pristine)
      Vue.set(state.containers, 'police', ns.containers.police.pristine)

      ios = io(url, {transports: ['polling']})

      ios.on("connect", () => {
        // Do nothing, sever will automatically respond by sending and RTC offer
        console.log('IO connected');
      });

      let peerConnection = null; // 'Smuggle' the reference out of socket.io scope

      // When we get the required info (offer) to establish WebRTC connection
      ios.on("offer", (description) => {
        peerConnection = new RTCPeerConnection(webrtcConfig);

        peerConnection
          .setRemoteDescription(description)
          .then(() => peerConnection.createAnswer())
          .then(sdp => peerConnection.setLocalDescription(sdp))
          .then(() => {
            // Send the server information about us
            ios.emit("answer", peerConnection.localDescription);
          });

        peerConnection.ondatachannel = event => {
          console.log('New channel made with label', event.channel.label);
          if (event.channel.label === 'NewSyncLowPrio') {
            event.channel.send('x') // ping the server that the channel is open due to wrtc node.js bug
          }
          else if (event.channel.label === 'NewSync') {
            resolve()
            ns.setConnection(peerConnection, event.channel)
          }
          event.channel.binaryType = 'arraybuffer'
          event.channel.onmessage = (msg) => {
            if (ns.handleIfFrameworkMessage(msg.data)) {
              Vue.set(state.containers, 'health', {...ns.containers.health.pristine})
              Vue.set(state.containers, 'police', {...ns.containers.police.pristine})
              const mi = new MessageInfoModel(msg.data, ns.dict, ++state.messagesReceived, new Date())
              state.receivedMessages.push(mi)
              state.lengthMsgPack += mi.lengthFinal
              state.lengthMsgPackNoDict += mi.lengthNoDict
              state.lengthJson += mi.lengthJsonDict
              state.lengthJsonNoDict += mi.lengthJsonNoDict
            }
          }
        };

        // When we get a possible way from us to the server, tell them
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            ios.emit("candidate", event.candidate);
          }
        };
      });

      // Server responded with possible way of reaching them
      ios.on("candidate", (candidate) => {
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.error(e));
      });

      return promise
    }
  },
  modules: {}
})
