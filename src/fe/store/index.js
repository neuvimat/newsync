import Vue from 'vue'
import Vuex from 'vuex'
import {createSimulation} from "@/be/model/CreateSimulation";
import {Random} from "@Lib/random";
import {Ambulance} from "@/be/model/ambulance";
import {NewSyncClient} from "@Lib/client/NewSyncClient";
import {WebSocketDriverClient} from "@Lib/client/drivers/WebSocketDriverClient";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {LongKeyDictionaryClient} from "@Lib/shared/LongKeyDictionaryClient";
import {ClientCommandFactory} from "@Lib/client/commands/ClientCommandFactory";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {ALIAS} from "@Lib/shared/ALIAS";
import {MessageInfoModel} from "@/fe/models/MessageInfoModel";
import {KEYWORDS} from "@Lib/shared/SYMBOLS";
import {pack} from 'msgpackr'

Vue.use(Vuex)

const tEncoder = new TextEncoder()

let ws = null
let io = null
let wrtc = null

export default new Vuex.Store({
  state: {
    newSync: null,
    receivedMessages: [],
    containers: {},
    ready: false,

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
      ns.addContainer('health', new SimpleContainer())
      ns.addContainer('police', new SimpleContainer())
      ns.on(ALIAS.EVENT_SYNC, (event) => {
        console.log('event.message', event.message);
        if (event.message[KEYWORDS.meta] || event.message[KEYWORDS.containers] || event.message[KEYWORDS.deletes]) {
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
    }
  },
  modules: {}
})
