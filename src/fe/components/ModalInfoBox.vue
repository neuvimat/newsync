<template>
  <div class="modal-info-box">
    <div v-if="type === 0">
      Ambulance:
      <AmbulanceView :show-hospital="true" :ambulance="entity"/>
    </div>
    <div v-else-if="type === 1">
      Hospital:
      <HospitalView :show-ambulances="true" :hospital="entity"/>
    </div>
    <div v-else-if="type === 2">
      Police car:
      <CarView :show-station="true" :car="entity"/>
    </div>
    <div v-else-if="type === 3">
      Police station:
      <StationView :show-cars="true" :station="entity"/>
    </div>
  </div>
</template>

<script>
import AmbulanceView from "@/fe/components/AmbulanceView";
import HospitalView from "@/fe/components/HospitalView";
import StationView from "@/fe/components/StationView";
import CarView from "@/fe/components/CarView";

export default {
  name: "ModalInfoBox",
  components: {CarView, StationView, HospitalView, AmbulanceView},
  props: ['entity', 'type']
}
</script>

<style scoped>
.modal-info-box {
  z-index: 99999;
  background-color: white;
  position: fixed;
  bottom: 32px;
  left: 50%;
  width: 600px;
  border: 1px solid gray;
  padding: 1em;
  border-radius: 1em;
  transform: translateX(-50%);
}
</style>
