<template>
  <div @click="expanded = !expanded">
    <div>{{formatTime(messageInfo.time)}}Message #{{messageInfo.id}}</div>
    <div>Messagepack + dictionary: {{messageInfo.lengthFinal}}</div>
    <div>Messagepack: {{messageInfo.lengthNoDict}}</div>
    <div>Json + dictionary: {{messageInfo.lengthJsonDict}}</div>
    <div>Json: {{messageInfo.lengthJsonNoDict}}</div>
    <JsonView v-if="expanded" :message="messageInfo.message"/>
  </div>
</template>

<script>
import {MessageInfoModel} from "@/models/MessageInfoModel";
import {formatTime} from "@Lib/format.mjs";
import JsonView from "@/components/JsonView";

export default {
  name: "MessageInfo",
  components: {JsonView},
  props: {
    messageInfo: {
      type: MessageInfoModel
    }
  },
  data() {
    return {
      expanded: false
    }
  },
  methods: {
    formatTime
  }
}
</script>

<style scoped>

</style>
