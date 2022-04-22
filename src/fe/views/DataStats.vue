<template>
  <div class="data-stats">
    <div class="top-buttons"></div>
    <div class="scrollable-list">
    <MessageInfo v-for="m in messageInfos"/>
    </div>
    <div class="bot-buttons">
      <button @click="$emit('clearHistory')">Clear history</button>
    </div>
  </div>
</template>

<script>
import MessageInfo from "@/fe/components/MessageInfo";
export default {
  name: "DataStats",
  components: {MessageInfo},
  props: ['messageInfos'],
  data() {
    return {}
  }
}
</script>

<style scoped>
.data-stats {

}
</style>
