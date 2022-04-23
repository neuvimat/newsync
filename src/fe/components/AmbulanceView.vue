<template>
  <div class="ambulance-view">
    <div class="header" @click="expanded = !expanded">{{ambulance.id}}: {{ambulance.sign}}</div>
    <div class="body" v-if="expanded">
      <div class="is-home">Status: {{status}}</div>
      <div class="position">Position: {{ambulance.pos.lat}}N {{ambulance.pos.lon}}E</div>
      <div class="hospital" v-if="showHospital">
        <div>Assigned hospital:</div>
        <HospitalView :hospital="hospitals[ambulance.hospital]" :show-ambulances="false"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AmbulanceView",
  components: {HospitalView: ()=> import('@/fe/components/HospitalView')},
  props: ['ambulance', 'showHospital'],
  data() {
    return {expanded: null,}
  },
  computed: {
    hospitals() {
      return this.$store.state.containers.health?.hospitals || {}
    },
    status() {
      const h = this.hospitals[this.ambulance.hospital]
      if (!h) {
        return 'No hospital data known!'
      }
      else if (this.ambulance.pos.lat === h.pos.lat && this.ambulance.pos.lon === h.pos.lon) {
        return 'Stationed at base!'
      }
      else {return 'On a mission!'}
    }
  }
}
</script>

<style scoped>
.ambulance-view .body {
  padding: .25em;
}

</style>
