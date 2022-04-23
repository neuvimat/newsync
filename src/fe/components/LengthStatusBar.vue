<template>
  <div class="length-status-bar">
    <div>Full (JSON): {{ total }}</div>
    <div>Full (Messagepack): {{ total }}</div>
    <div>MessagePack: {{ msgPack }}</div>
    <div>MessagePack (no dictionary): {{ msgPackNoDict }}</div>
    <div>JSON: {{ json }}</div>
    <div>JSON (no dictionary): {{ jsonNoDict }}</div>
  </div>
</template>

<script>
import {byteSize} from "@Lib/format.mjs";

export default {
  name: "LengthStatusBar",
  computed: {
    msgPack() {return byteSize(this.$store.state.lengthMsgPack)},
    msgPackNoDict() {return byteSize(this.$store.state.lengthMsgPackNoDict)},
    json() {return byteSize(this.$store.state.lengthJson)},
    jsonNoDict() {return byteSize(this.$store.state.lengthJsonNoDict)},
    total() {return byteSize(
      this.$store.state.lengthMsgPack+
      this.$store.state.lengthMsgPackNoDict+
      this.$store.state.lengthJson+
      this.$store.state.lengthJsonNoDict)}
  }
}
</script>

<style scoped>
.length-status-bar {
  border-top: 1px solid #555;
  background-color: white;
  z-index: 50000;
  position: fixed;
  height: 20px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
}

.length-status-bar > div {
  flex: 1 0 auto;
}
</style>
