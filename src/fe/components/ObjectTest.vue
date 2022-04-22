<template>
  <div>
    <div>XD</div>
    <div>{{stuff}}</div>
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
      merge(this.$store.state.stuff.c, {padoasd: 'naisdkassssssssssssssssssssssssssd'})
    },
    addNote() {this.object.addNote('1', '2')}
  }
}
</script>

<style scoped>

</style>
