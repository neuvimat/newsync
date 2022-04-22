<template>
  <div class="message-json-view">{{view}}</div>
</template>

<script>
export default {
  name: "JsonView",
  props: ['message'],
  computed: {
    view() {
      return JSON.stringify(this.message, null, 2)
    }
  }
}
</script>

<style scoped>
.message-json-view {
  white-space: pre;
}
</style>
