<template>
  <div class="map">
    {{zoom}}
    <LMap
      :zoom="zoom"
      :center="center"
      @update:zoom="zoomUpdated"
      @update:center="centerUpdated"
      @update:bounds="boundsUpdated">
      <LTileLayer
        :url="`https://zzs.fel.cvut.cz/tiles/{z}/{x}/{y}.png`"
      ></LTileLayer>
      <LMarker :lat-lng="[49,18]"></LMarker>
    </LMap>
  </div>
</template>

<script>
import {LMap, LTileLayer, LMarker, LIcon} from "vue2-leaflet";
import 'leaflet/dist/leaflet.css';

import { Icon } from 'leaflet';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


export default {
  name: "SimulationView",
  components: {LMap, LTileLayer, LMarker, LIcon},
  data() {
    return {
      zoom: 12,
      center: [49, 18]
    }
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
