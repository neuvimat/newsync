<template>
  <div class="ambulance-view">
    <div class="header">
      <span class="button wander" @click="sendEvent('spasmCar', car.id)"></span>
      <span class="button home" @click="sendEvent('recallCar', car.id)"></span>
      <span class="button stop" @click="sendEvent('stopCar', car.id)"></span>
      <span @click="expanded = !expanded">{{ car.id }}: {{ car.sign }} {{expanded ? '-' : '+'}}</span>
    </div>
    <div v-if="expanded" class="body">
      <div class="is-home">Status: {{ status }}</div>
      <div class="is-home">Type: {{ type }}</div>
      <div class="position">Position: {{ car.pos.lat }}N {{ car.pos.lon }}E</div>
      <div v-if="showStation" class="hospital">
        <div>Police station:</div>
        <div class="hospital-wrapper">
          <StationView :station="stations[car.station]" :show-ambulances="false"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

const POLICE_TYPE = {'city': 'City police', 'swat': 'URNA', 'state': 'State police'}

export default {
  name: "CarView",
  components: {StationView: () => import('@/fe/components/StationView')},
  props: ['car', 'showStation'],
  methods: {
    sendEvent(eventName, ...args) {
      this.$store.dispatch('sendEvent', {event: eventName, args: args})
    },
  },
  data() {
    return {expanded: null,}
  },
  computed: {
    type() {
      return POLICE_TYPE[this.car.type]
    },
    stations() {
      return this.$store.state.containers.police?.stations || {}
    },
    status() {
      const h = this.stations[this.car.station]
      if (!h) {
        return 'No hospital data known!'
      }
      else if (this.car.pos.lat === h.pos.lat && this.car.pos.lon === h.pos.lon) {
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
