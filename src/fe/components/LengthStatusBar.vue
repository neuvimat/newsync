<template>
  <div class="length-status-bar">
    <div>Full (JSON): {{ fullJson }} (100%)</div>
    <div>Full (Messagepack): {{ fullMsgpack }} ({{
        (this.$store.state.lengthFullMsgpack * 100 / this.$store.state.lengthFullJson).toFixed(2) + '%'
      }} )</div>
    <div>MessagePack: {{ msgPack }} ({{
        (this.$store.state.lengthMsgPack * 100 / this.$store.state.lengthFullJson).toFixed(2) + '%'
      }})</div>
    <div>MessagePack (no dictionary): {{ msgPackNoDict }} ({{
        (this.$store.state.lengthMsgPackNoDict * 100 / this.$store.state.lengthFullJson).toFixed(2) + '%'
      }})</div>
    <div>JSON: {{ json }} ({{
        (this.$store.state.lengthJson * 100 / this.$store.state.lengthFullJson).toFixed(2) + '%'
      }})</div>
    <div>JSON (no dictionary): {{ jsonNoDict }} ({{
        (this.$store.state.lengthJsonNoDict * 100 / this.$store.state.lengthFullJson).toFixed(2) + '%'
      }})</div>
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
    fullJson() {return byteSize(this.$store.state.lengthFullJson)},
    fullMsgpack() {return byteSize(this.$store.state.lengthFullMsgpack)},
  }
}
</script>

<style scoped>
.length-status-bar {
  border-top: 1px solid #555;
  background-color: white;
  z-index: 9999999999;
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
