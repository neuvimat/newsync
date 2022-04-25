<template>
  <div class="hospital-view">
    <div class="header" @click="expanded = !expanded">{{ hospital.id }}: {{ hospital.name }}</div>
    <div v-if="expanded" class="body">
      <div class="address">Address: {{ hospital.address }}</div>
      <div class="position">Position: {{ hospital.pos.lat }}N {{ hospital.pos.lon }}E</div>
      <template v-if="showAmbulances">
        <div class="ambulances">
          <div class="header">Ambulances:</div>
          <div class="content">
            <AmbulanceView v-for="a in hospital.ambulances" :ambulance="ambulances[a]" :showHospital="false"/>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import AmbulanceView from "@/fe/components/AmbulanceView";

export default {
  name: "HospitalView",
  components: {AmbulanceView},
  props: ['hospital', 'showAmbulances'],
  data() {
    return {
      expanded: false
    }
  },
  computed: {
    ambulances() {
      return this.$store.state.containers.health?.ambulances || {}
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
