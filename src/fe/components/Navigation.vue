<template>
  <div class="navigation">
    <router-link to="/">Home</router-link>
    |
    <router-link to="/sim">Simulation</router-link>
    |
    <router-link to="/data">Data statistics</router-link>
    |
    <router-link to="/map">Map</router-link>
  </div>
</template>

<script>
export default {
  name: "Navigation"
}
</script>

<style scoped>
.navigation {
  z-index: 500000;
  position: fixed;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  background-color: white;
  border: 1px solid black;
  border-top: 0;
  border-bottom-left-radius: .6em;
  border-bottom-right-radius: .6em;
  padding: 0 .5em;
}
.navigation a {
  padding: 0 .25em;
  text-decoration: none;
}
</style>
