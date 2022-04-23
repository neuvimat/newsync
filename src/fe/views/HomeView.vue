<template>
  <div class="home">
    <h1>NewSync demo application</h1>
    <h2>Connection type</h2>
    <div>Please choose your connection type:</div>
    <div>
      <select v-model="connectionType">
        <option value="0">Websocket</option>
        <option value="1">WebRTC</option>
        <!--        <option value="2" disabled>socket.io</option>-->
      </select>
    </div>
    <button @click="connect">Connect</button>
  </div>
</template>

<script>
import {pack} from 'msgpackr'
import MessageInfo from "@/fe/components/MessageInfo";
import {MessageInfoModel} from "@/fe/models/MessageInfoModel";
import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {cloneDeep} from "lodash";
import Vue from "vue";
import ObjectTest from "@/fe/components/ObjectTest";
import {merge} from "@Lib/objUtil";

const dic = new LongKeyDictionaryServer()

export default {
  name: 'HomeView',
  data() {
    return {
      msg: new MessageInfoModel(pack(dic.shortenObject({a: {x: 1, blabla: 'lolec', rlyLongKey: 2}})), dic, 1, new Date()),
      msg2: null,
      connectionType: 1,
      version: 0
    }
  },
  components: {
    ObjectTest,
    MessageInfo
  },
  computed: {
    stuff() {
      return this.$store.state.stuff
    }
  },
  methods: {
    connect(option) {},
    connectWS() {},
    connectRTC() {}
  },
  beforeMount() {
  }
}
</script>

<style scoped>
.home {
  max-width: 1400px;
  margin: auto;
  padding: 0 2em;
}
</style>
