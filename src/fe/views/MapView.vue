<template>
  <div class="map">
    <LMap
      :zoom="zoom"
      :center="center"
      @click="entity = null"
      @update:zoom="zoomUpdated"
      @update:center="centerUpdated"
      @update:bounds="boundsUpdated">
      <LTileLayer
        :url="`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`"
        :attribution="attribution"
      />
      <LMarker v-for="a in ambulances" :lat-lng="[a.pos.lat,a.pos.lon]" @click="selectEntity('health', 'ambulances', a.id, 0)">
        <LIcon :icon-url="ambulanceIcon" :icon-size="[32,40]" :icon-anchor="[16,40]"/>
      </LMarker>
      <LMarker v-for="h in hospitals" :lat-lng="[h.pos.lat,h.pos.lon]" @click="selectEntity('health', 'hospitals', h.id, 1)">
        <LIcon :icon-url="hospitalIcon" :icon-size="[40,40]" :icon-anchor="[20,40]"/>
      </LMarker>
      <LMarker v-for="c in cars" :lat-lng="[c.pos.lat,c.pos.lon]" @click="selectEntity('police', 'cars', c.id, 2)">
        <LIcon :icon-url="carIcon" :icon-size="[32,40]" :icon-anchor="[16,40]"/>
      </LMarker>
      <LMarker v-for="s in stations" :lat-lng="[s.pos.lat,s.pos.lon]" @click="selectEntity('police', 'stations', s.id, 3)">
        <LIcon :icon-url="stationIcon" :icon-size="[40,40]" :icon-anchor="[20,40]"/>
      </LMarker>
    </LMap>
    <ModalInfoBox :entity="entity" v-if="entity" :type="type"/>
    <LengthStatusBar/>
    <Messages/>
  </div>
</template>

<script>
import {LMap, LTileLayer, LMarker, LIcon} from "vue2-leaflet";
import 'leaflet/dist/leaflet.css';
import ambulanceMarker from '@/assets/map-ambulance.png'
import hospitalMarker from '@/assets/map-hospital.png'
import stationMarker from '@/assets/map-station.png'
import carMarker from '@/assets/map-police.png'

import { Icon } from 'leaflet';
import LengthStatusBar from "@/fe/components/LengthStatusBar";
import Messages from "@/fe/components/Messages";
import {isEmpty} from "@Lib/util/objUtil";
import ModalInfoBox from "@/fe/components/ModalInfoBox";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: "MapView",
  components: {ModalInfoBox, Messages, LengthStatusBar, LMap, LTileLayer, LMarker, LIcon},
  data() {
    return {
      zoom: 12,
      center: [49, 18],
      attribution: `&copy; <a href=\\\\"https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
      entity: null,
      type: 0,
    }
  },
  computed: {
    ambulanceIcon() {return ambulanceMarker},
    hospitalIcon() {return hospitalMarker},
    carIcon() {return carMarker},
    stationIcon() {return stationMarker},
    hospitals() {
      return this.$store.state.containers?.health?.hospitals || {}
    },
    stations() {
      return this.$store.state.containers?.police?.stations || {}
    },
    ambulances() {
      const ambs = {...(this.$store.state.containers?.health?.ambulances || {})}
      const hos = this.$store.state.containers?.health?.hospitals || {}
      if (isEmpty(hos)) return ambs;
      // Don't show ambulances at bases
      for (const k in Object.keys(ambs)) {
        const a = ambs[k]
        const h = hos[a.hospital]
        if (a.pos.lat === h.pos.lat && a.pos.lon === h.pos.lon) {
          delete ambs[k]
        }
      }
      return ambs;
    },
    cars() {
      const cars = {...(this.$store.state.containers?.police?.cars || {})}
      const stations = this.$store.state.containers?.police?.stations || {}
      if (isEmpty(stations)) return cars;
      // Don't show ambulances at bases
      for (const k in Object.keys(cars)) {
        const a = cars[k]
        const h = stations[a.station]
        if (a.pos.lat === h.pos.lat && a.pos.lon === h.pos.lon) {
          delete cars[k]
        }
      }
      return cars;
    },
  },
  methods: {
    selectEntity(container, key, id, type) {
      this.type = type
      this.entity = this.$store.state.containers[container][key][id]
    },
    zoomUpdated (zoom) {
      this.zoom = zoom;
    },
    centerUpdated (center) {
      this.center = center;
    },
    boundsUpdated (bounds) {
      this.bounds = bounds;
    }
  },
}
</script>

<style scoped>
.map {
  height: calc(100vh - 20px);
  width: 100vw;
  /*position: relative;*/
}
</style>
