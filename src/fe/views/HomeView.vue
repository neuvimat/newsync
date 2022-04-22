<template>
  <div class="home">
    <h1>NewSync demo application</h1>
    <h2>Connection type</h2>
    <div>Please choose your connection type before proceeding further.</div>
    <div>
      <select v-model="connectionType">
        <option value="0">Websocket</option>
        <option value="1">WebRTC</option>
        <!--        <option value="2" disabled>socket.io</option>-->
      </select>
    </div>
    <button @click="connect">Connect</button>
    <h2>Testing area</h2>
    <div>{{ stuff }}</div>
    <br/>
    <button @click="addNote">Add note</button>
    <ObjectTest :object="stuff.c"/>
  </div>
</template>

<script>
// @ is an alias to /src

import {pack} from 'msgpackr'
import MessageInfo from "@/components/MessageInfo";
import {MessageInfoModel} from "@/models/MessageInfoModel";
import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {cloneDeep} from "lodash";
import Vue from "vue";
import ObjectTest from "@/components/ObjectTest";
import {merge} from "@Lib/objUtil";

const dic = new LongKeyDictionaryServer()

export default {
  name: 'HomeView',
  data() {
    return {
      msg: new MessageInfoModel(pack(dic.shortenObject({a: {x: 1, blabla: 'lolec', rlyLongKey: 2}})), dic, 1, new Date()),
      msg2: null,
      connectionType: 1,
      version:0
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
    addNote() {
      if (this.version === 0) {
        merge(this.stuff, {d: {xxx: Math.random()}, we: {go: {really: {deep: {yo: {nice: 69}}}}}})
      }
      if (this.version === 1) {
        this.stuff.we.go.really.deep.yo.nice = 68
      }
      if (this.version === 2) {
        this.stuff.we.go.notDeep = 67
      }
      if (this.version === 3) {
        this.stuff.we.go.really.deep.yo.nice = 10
      }
      if (this.version === 4) {
        this.stuff.c.x = 420
      }
      this.version++
      this.$store.state.stuff = {...this.stuff}
    },
    log() {console.log(this.stuff)},
    connect() {

    },
    helper() {
      Vue.set(this.stuff.c, Math.random(), 'XD')
    }
  },
  beforeMount() {
    const stuff = {a: 10, b: [1, 2, 3], c: {a: 10, b: 20}}
    this.$store.state.stuff = stuff

    /*
    const msg = {c: {x: 1, blabla: 'lolec', rlyLongKey: 2}}
    for (let x in msg.c) {
      console.log(msg.c[x]);
      msg.c[x] = pack(msg.c[x])
    }
    console.log('msg', msg);
    const msg2 = cloneDeep(msg)
    const msg2short = dic.shortenObject(msg2)
    console.log('msg2', msg2);
    console.log('msg2short', msg2short);
    const msg2Packed = new MessageInfoModel(pack(msg2short), dic, 2, new Date())
    this.msg2 = msg2Packed
    */
  }
}
</script>

<style scoped>
.home {
  max-width: 1400px;
  margin: auto;
}
</style>
