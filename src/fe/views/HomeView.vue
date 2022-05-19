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
            </select>
          </legend>
          <div v-if="connectionType === '0'">
            <label>Websocket URL:<br/><input v-model="websocketUrl" type="text"></label>
          </div>
          <div v-if="connectionType === '1'">
            <label>Signalling socket.io server URL:<br/><input v-model="signalUrl" type="text"></label>
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
        observe! You can do so in the
        <router-link to="/sim">simulation view</router-link>
        by ticking the
        container's checkbox .</b></p>
      <p>Use the
        <router-link to="/map">map</router-link>
        to see an example application running on the NewSync framework!
      </p>
      <p>Use the
        <router-link to="/sim">simulation view</router-link>
        to see the simulation in a different, more data
        oriented view, that also allows you to interact with the server!
      </p>
    </div>
    <div>
      <h2>Acknowledgements</h2>
      <ul>
        <li>Hospital icon by 'medical', available at shareicon.com</li>
        <li><a href="https://www.flaticon.com/free-icons/police-car" title="police car icons">Police car icons created by Freepik - Flaticon</a></li>
        <li><a href="https://www.flaticon.com/free-icons/ambulance" title="ambulance icons">Ambulance icons created by Freepik - Flaticon</a></li>
        <li>Map tiles kindly provided by OpenStreetMap: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
          contributors
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import MessageInfo from "@/fe/components/MessageInfo";
import ObjectTest from "@/fe/components/ObjectTest";

export default {
  name: 'HomeView',
  data() {
    return {
      connectionType: '0',
      signalUrl: 'http://localhost:8080',
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
      console.log('this.connectionType', this.connectionType);
      if (Number(this.connectionType) === 0) {
        this.$store.dispatch('connectWS', {url: this.websocketUrl})
          .then(() => {
            this.setup = 2
            this.$store.state.ready = true
          })
          .catch(() => {
            this.setup = 0
          })
      }
      else if (Number(this.connectionType) === 1) {
        this.$store.dispatch('connectRtc', {url: this.signalUrl})
          .then(() => {
            this.setup = 2
            this.$store.state.ready = true
          })
          .catch(() => {
            this.setup = 0
          })
      }
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
