<template>
  <div class="home">
    <h1>NewSync demo application</h1>
    <div v-if="!$store.state.ready && setup === 0">
      <h2>Connection type</h2>
      <form>
        <div class="form-header">Please choose your connection type:</div>
        <fieldset>
          <legend>
            <select v-model="connectionType">
              <option value="0">Websocket</option>
              <option value="1">WebRTC</option>
              <!--        <option value="2" disabled>socket.io</option>-->
            </select>
          </legend>
          <div v-if="connectionType == 0">
            <label>Websocket URL:<br/><input v-model="websocketUrl" type="text"></label>
          </div>
          <div v-if="connectionType == 1">
            <label>Signalling server URL:<br/><input v-model="signalUrl" type="text"></label>
          </div>
        </fieldset>
        <button @click="connect">Connect</button>
      </form>
    </div>
    <div v-else-if="!$store.state.ready && setup === 1">Connecting to the server, please wait...</div>
    <div v-else>
      <h1>Connected</h1>
      <p>Successfully connected to the server!</p>
      <p><b>To better demonstrate dynamic subscription to just parts of the whole simulation state, before you can see
        any data or changes made to it, you first have to subscribe to a specific container you wish to
        observe! You can do so in the <router-link to="/sim">simulation view</router-link> by ticking the
        container's checkbox .</b></p>
      <p>Use the <router-link to="/map">map</router-link> to see an example application running on the NewSync framework!</p>
      <p>Use the <router-link to="/sim">simulation view</router-link> to see the simulation in a different, more data
        oriented view, that also allows you to interact with the server!</p>
    </div>
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
      connectionType: 0,
      signalUrl: '',
      websocketUrl: 'ws://localhost:8080',
      setup: 0,
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
    connect(e) {
      this.setup = 1
      e.preventDefault()
      this.$store.dispatch('connectWS', {url: this.websocketUrl})
        .then(() => {
          this.setup = 2
          this.$store.state.ready = true
        })
        .catch(() => {
          this.setup = 0
        })
    },
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

.form-header {
  margin-bottom: .5em;
}

fieldset {
  margin-bottom: .5em;
}

</style>
