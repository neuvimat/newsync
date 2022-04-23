<template>
  <div id="app">
    <Navigation/>
    <keep-alive>
      <router-view :key="$route.fullPath"/>
    </keep-alive>
  </div>
</template>

<script>
import Navigation from "@/fe/components/Navigation";

export default {
  name: 'App',
  components: {Navigation},
  mounted() {
    // let recaptchaScript = document.createElement('script')
    // recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js')
    // document.head.appendChild(recaptchaScript)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}
</style>
