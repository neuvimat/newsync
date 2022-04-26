<template>
  <div class="card">
    <slot name="header"></slot>
    <slot name="body"></slot>
  </div>
</template>

<script>
export default {
  name: "Card"
}
</script>

<style scoped>
.card {

}
</style>
