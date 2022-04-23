<template>
  <div class="data-stats">
    <div class="top-buttons"></div>
    <div class="scrollable-list">
    </div>
    <div class="bot-buttons">
      <button @click="$emit('clearHistory')">Clear history</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "DataStats",
  props: ['messageInfos'],
  data() {
    return {}
  }
}
</script>

<style scoped>
.data-stats {
  height: 22px;
}
</style>
