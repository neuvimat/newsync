<template>
  <div>
    <div>XD</div>
    <div>{{stuff}}</div>
    <div>{{stuff.c}}</div>
    <div>{{object}}</div>
    <div v-for="(v,k,i) in object">
      v: {{v}}; k: {{k}}; i: {{i}}
    </div>
    <button @click="change(object)">from isnide</button>
  </div>
</template>

<script>
import {merge} from "@Lib/objUtil";

export default {
  name: "ObjectTest",
  props: ['object'],
  computed: {
    stuff() {
      return this.$store.state.stuff
    }
  },
  methods: {
    change(obj) {
      console.log('challing hange');
      merge(this.$store.state.stuff, {d: {xxx: Math.random()}, we: {go: {really: {deep: {yo: {nice: 69}}}}}})
    },
    addNote() {this.object.addNote('1', '2')}
  }
}
</script>

<style scoped>

</style>
