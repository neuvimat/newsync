import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {pack, unpack} from "msgpackr";
import {LongKeyDictionary} from "@Lib/shared/LongKeyDictionary";
import {makeSimpleRecursiveProxy} from "@Lib/shared/SimpleProxy";
import {NeuSyncServer} from "@Lib/server/NeuSyncServer";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
const server = new NeuSyncServer(new WebSocketDriverServer(), new MessagePackCoder())
const {proxy, pristine, changes} = makeSimpleRecursiveProxy()
window.d = new LongKeyDictionary()
window.p = proxy
window.c = pristine
window.g = changes

proxy.arr = []
proxy.arr[0] = 15
proxy.arr.push(10)
proxy.arr.push(12)
console.log(proxy);
console.log(changes);