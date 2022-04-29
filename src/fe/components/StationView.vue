<template>
  <div class="hospital-view">
    <div class="header" @click="expanded = !expanded">{{ station.id }}: {{ station.name }} {{expanded ? '-' : '+'}}</div>
    <div v-if="expanded" class="body">
      <div class="address">Address: {{ station.address }}</div>
      <div class="position">Position: {{ station.pos.lat }}N {{ station.pos.lon }}E</div>
      <template v-if="showCars">
        <div class="ambulances">
          <div class="header">Police vehicles:</div>
          <div class="content">
            <CarView v-for="a in station.cars" :car="cars[a]" :showHospital="false"/>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import AmbulanceView from "@/fe/components/AmbulanceView";
import CarView from "@/fe/components/CarView";

export default {
  name: "StationView",
  components: {CarView, AmbulanceView},
  props: ['station', 'showCars'],
  data() {
    return {
      expanded: false
    }
  },
  computed: {
    cars() {
      return this.$store.state.containers.police?.cars || {}
    }
  }
}
</script>

<style scoped>
.hospital-view {
}

.hospital-view > .body {
  padding: .5em;
}

.hospital-view > .header {

}

.hospital-view .ambulances .content {
  padding: .25em;
}

.hospital-view .ambulances .header {

}
</style>
