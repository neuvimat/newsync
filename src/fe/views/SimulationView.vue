<template>
  <div class="simulation-view">
    <h1>Data simulace</h1>
    <details class="containers">
      <summary><h2>Containers</h2></summary>
      <div class="containers">
        <template v-for="(v,k) in containers">
          <div><input type="checkbox" @click="subscribe(k)"><span>{{ k }}</span></div>
        </template>
      </div>
    </details>
    <details open>
      <summary><h2>Data</h2></summary>
      <details open>
        <summary><h3>Hospitals</h3></summary>
        <HospitalView v-for="h in hospitals" :ambulances="ambulances" :hospital="h" :show-ambulances="true"/>
      </details>
      <details open>
        <summary><h3>Ambulances</h3></summary>
        <AmbulanceView v-for="a in ambulances" :ambulance="a" :hospitals="hospitals" :show-hospital="true"/>
      </details>
    </details>

    <div v-if="showRawState" class="raw-data">
      <JsonView :message="$store.state.containers"/>
    </div>
    <div class="requests">
      <h2>Requests</h2>
      <div class="command send-ambulance">
        <button>Send ambulance</button>
        <label>Ambulance ID:<input type="number" min="0" step="1"></label>
        <label>Target latitude:<input type="number" step="0.01"></label>
        <label>Target longitude:<input type="number" step="0.01"></label>
      </div>
      <div class="command recall-ambulance">
        <button>Recall ambulance</button>
        <label>Ambulance ID:<input type="number" min="0" step="1"></label>
      </div>
      <div class="command move-number">
        <button>Make X ambulances moving</button>
        <label>X:<input type="number" min="0" step="1"></label>
      </div>
      <div class="command stop-all">
        <button>Stop all ambulances</button>
      </div>
    </div>
  </div>
</template>

<script>
import JsonView from "@/fe/components/JsonView";
import HospitalView from "@/fe/components/HospitalView";
import AmbulanceView from "@/fe/components/AmbulanceView";

export default {
  name: "SimulationView",
  components: {AmbulanceView, HospitalView, JsonView},
  data() {
    return {
      showRawState: false
    }
  },
  methods: {
    subscribe(k) {

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
</style>
