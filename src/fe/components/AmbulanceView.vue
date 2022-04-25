<template>
  <div class="ambulance-view">
    <div class="header">
      <span class="button wander" @click="sendEvent('spasmAmbulance', ambulance.id)"></span>
      <span class="button home" @click="sendEvent('recallAmbulance', ambulance.id)"></span>
      <span class="button stop" @click="sendEvent('stop', ambulance.id)"></span>
      <span @click="expanded = !expanded">{{ ambulance.id }}: {{ ambulance.sign }}</span>
    </div>
    <div v-if="expanded" class="body">
      <div class="is-home">Status: {{ status }}</div>
      <div class="position">Position: {{ ambulance.pos.lat }}N {{ ambulance.pos.lon }}E</div>
      <div v-if="showHospital" class="hospital">
        <div>Hospital:</div>
        <div class="hospital-wrapper">
          <HospitalView :hospital="hospitals[ambulance.hospital]" :show-ambulances="false"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "AmbulanceView",
  components: {HospitalView: () => import('@/fe/components/HospitalView')},
  props: ['ambulance', 'showHospital'],
  methods: {
    sendEvent(eventName, ...args) {
      this.$store.dispatch('sendEvent', {event: eventName, args: args})
    },
  },
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

.header {
  display: flex;
  margin: .15em;
}

.header > span:first-child {
  justify-self: center;
}

.button {
  justify-self: center;
  display: inline-block;
  background-color: white;
  border: 1px solid #aaa;
  width: 18px;
  height: 18px;
  margin-right: 0.25em;
  line-height: 10px;
}
.hospital-wrapper {
  padding: .25em;
}
.wander {
  background-image: url(~@/assets/icon-wander.png);
}
.stop {
  background-image: url(~@/assets/icon-stop.png);
}
.home {
  background-image: url(~@/assets/icon-home.png);
}
</style>
