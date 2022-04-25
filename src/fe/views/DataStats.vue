<template>
  <div class="data-stats">
    <h1>Received messages:</h1>
    <LengthStatusBar></LengthStatusBar>
    <MessageInfo v-for="message in messages" :message-info="message"/>
  </div>
</template>

<script>
import LengthStatusBar from "@/fe/components/LengthStatusBar";
import Messages from "@/fe/components/Messages";
import MessageInfo from "@/fe/components/MessageInfo";
export default {
  name: "DataStats",
  components: {MessageInfo, Messages, LengthStatusBar},
  computed: {
    messages() {return this.$store.state.receivedMessages}
  },
  data() {
    return {}
  }
}
</script>

<style>
.data-stats {
  max-width: 1400px;
  padding: 0 2em;
  margin: auto auto 30px;
}
td:first-child {
  width: 75%;
}
td:last-child {
  width: 25%;
}
</style>
