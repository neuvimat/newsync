import Vue from 'vue'
import Vuex from 'vuex'
import {createSimulation} from "@/be/model/CreateSimulation";
import {Random} from "@Lib/random";
import {Ambulance} from "@/be/model/ambulance";

Vue.use(Vuex)

const health = createSimulation({}, 69, 420)

export default new Vuex.Store({
  state: {
    newSync: null,
    receivedMessages: [],
    containers: {health},

    lengthMsgPack: 0,
    lengthMsgPackNoDict: 0,
    lengthJson: 0,
    lengthJsonNoDict: 0,
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
