import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {pack, unpack} from "msgpackr";
import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {makeSimpleRecursiveProxy} from "@Lib/shared/SimpleProxy";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
