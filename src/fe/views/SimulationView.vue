<template>
  <div class="simulation-view">
    <LengthStatusBar/>
    <h1>Data simulace</h1>
    <details class="containers" open>
      <summary><h2>Containers</h2></summary>
      <div class="containers">
        <div><input type="checkbox" @input="subscribeAll($event)"><span>Send all override</span></div>
        <hr>
        <template v-for="(v,k) in containers">
          <div><input type="checkbox" v-model="checkboxes[k]" @input="subscribe($event, k)"><span>{{ k }}</span></div>
        </template>
      </div>
    </details>
    <details open>
      <summary><h2>Data</h2></summary>
      <details>
        <summary><h3>Hospitals</h3></summary>
        <HospitalView v-for="h in hospitals" :ambulances="ambulances" :hospital="h" :show-ambulances="true"/>
      </details>
      <details>
        <summary><h3>Ambulances</h3></summary>
        <AmbulanceView v-for="a in ambulances" :ambulance="a" :hospitals="hospitals" :show-hospital="true"/>
      </details>
    </details>
    <details>
      <summary><h2>Raw data</h2></summary>
      <JsonView :message="$store.state.containers"></JsonView>
    </details>

    <div class="requests">
      <h2>Requests</h2>
      <div class="command send-ambulance">
        <button @click="sendEvent('sendAmbulance', sendId, sendLon, sendLat)">Send ambulance</button>
        <label>Ambulance ID:<input v-model="sendId" type="number" min="0" step="1"></label>
        <label>Target longitude:<input v-model="sendLon" type="number" step="0.01"></label>
        <label>Target latitude:<input v-model="sendLat" type="number" step="0.01"></label>
      </div>
      <div class="command spasm-ambulance">
        <button @click="sendEvent('spasmAmbulance', spasmId)">Make ambulance wander</button>
        <label>Ambulance ID:<input v-model="spasmId" type="number" min="0" step="1"></label>
      </div>
      <div class="command recall-ambulance">
        <button @click="sendEvent('recallAmbulance', recallId)">Recall ambulance</button>
        <label>Ambulance ID:<input v-model="recallId" type="number" min="0" step="1"></label>
      </div>
      <div class="command move-number">
        <button @click="sendEvent('moveAmbulances', moveQuantity)">Make X ambulances moving</button>
        <label>X:<input v-model="moveQuantity" type="number" min="0" step="1"></label>
      </div>
      <div class="command stop-once">
        <button @click="sendEvent('stop', stopId)">Stop ambulance</button>
        <label>X:<input v-model="stopId" type="number" min="0" step="1"></label>
      </div>
      <div class="command stop-all">
        <button @click="sendEvent('stopAll')">Stop all ambulances</button>
      </div>
    </div>
  </div>
</template>

<script>
import JsonView from "@/fe/components/JsonView";
import HospitalView from "@/fe/components/HospitalView";
import AmbulanceView from "@/fe/components/AmbulanceView";
import LengthStatusBar from "@/fe/components/LengthStatusBar";
import {ClientCommandFactory} from "@Lib/client/commands/ClientCommandFactory";

export default {
  name: "SimulationView",
  components: {LengthStatusBar, AmbulanceView, HospitalView, JsonView},
  data() {
    return {
      showRawState: false,
      checkboxes: {},
      subscribeAllOverride: false,

      sendId: 0,
      sendLat: 0,
      sendLon: 0,
      spasmId: 0,
      recallId: 0,
      moveQuantity: 1,
      stopId: 0
    }
  },
  methods: {
    sendEvent(eventName, ...args) {
      this.$store.dispatch('sendEvent', {event: eventName, args: args})
    },

    check() {},
    subscribe(event, k) {
      this.checkboxes[k] = event.target.checked
      if (event.target.checked) {
        this.$store.state.newSync.sendCommand(ClientCommandFactory.SUBSCRIBE_CONTAINER(k))
      }
      else {
        this.$store.state.newSync.sendCommand(ClientCommandFactory.UNSUBSCRIBE_CONTAINER(k))
      }
    },
    subscribeAll(event) {
      this.subscribeAllOverride = event.target.checked
      if (event.target.checked) {
        this.$store.state.newSync.sendCommand(ClientCommandFactory.SUBSCRIBE_ALL())
      }
      else {
        this.$store.state.newSync.sendCommand(ClientCommandFactory.UNSUBSCRIBE_ALL())
      }
    }
  },
  props: [],
  computed: {
    containers() {
      return this.$store.state.containers
    },
    hospitals() {
      return this.$store.state.containers.health?.hospitals
    },
    ambulances() {
      return this.$store.state.containers.health?.ambulances
    },
  }
}
</script>

<style scoped>
summary h2, summary h3 {
  display: inline-block;
  margin: .25em 0;
}
.command > * {
  margin-right: .5em;
}
.simulation-view {
  max-width: 1400px;
  padding: 0 2em;
  margin: auto auto 30px;
}
hr {
  border: 0;
  border-top: 1px solid #aaa;
}
</style>
