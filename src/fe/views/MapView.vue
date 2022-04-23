<template>
  <div class="map">
    <LMap
      :zoom="zoom"
      :center="center"
      @update:zoom="zoomUpdated"
      @update:center="centerUpdated"
      @update:bounds="boundsUpdated">
      <LTileLayer
        :url="`https://zzs.fel.cvut.cz/tiles/{z}/{x}/{y}.png`"
      ></LTileLayer>
      <LMarker v-for="a in ambulances" :lat-lng="[a.pos.lat,a.pos.lon]"></LMarker>
      <LMarker v-for="h in hospitalMarkers" :lat-lng="[h.pos.lat,h.pos.lon]"></LMarker>
    </LMap>
    <LengthStatusBar/>
    <Messages/>
  </div>
</template>

<script>
import {LMap, LTileLayer, LMarker, LIcon} from "vue2-leaflet";
import 'leaflet/dist/leaflet.css';

import { Icon } from 'leaflet';
import LengthStatusBar from "@/fe/components/LengthStatusBar";
import Messages from "@/fe/components/Messages";
import {isEmpty} from "@Lib/objUtil";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: "MapView",
  components: {Messages, LengthStatusBar, LMap, LTileLayer, LMarker, LIcon},
  data() {
    return {
      zoom: 12,
      center: [49, 18]
    }
  },
  computed: {
    hospitalMarkers() {
      return this.$store.state.containers?.health?.hospitals || {}
    },
    ambulances() {
      const ambs = {...(this.$store.state.containers?.health?.ambulances || {})}
      const hos = this.$store.state.containers?.health?.hospitals || {}
      if (isEmpty(hos)) return ambs;
      for (const k in Object.keys(ambs)) {
        const a = ambs[k]
        const h = hos[a.hospital]
        if (a.pos.lat === h.pos.lat && a.pos.lon === h.pos.lon) {
          delete ambs[a]
        }
      }
      return ambs;
    },
  },
  methods: {
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
  height: 100vh;
  width: 100vw;
  /*position: relative;*/
}
</style>
