<template>
  <div @click="expanded = !expanded" class="message-info">
    <div style="font-weight: bold">{{formatTime(messageInfo.time)}} - #{{messageInfo.id}}</div>
    <table>
      <tr><td>JSON:</td><td>{{messageInfo.lengthJsonNoDict}} B</td></tr>
      <tr><td>JSON + dictionary:</td><td>{{messageInfo.lengthJsonDict}} B</td></tr>
      <tr><td>Messagepack:</td><td>{{messageInfo.lengthNoDict}} B</td></tr>
      <tr><td>Messagepack + dictionary:</td><td>{{messageInfo.lengthFinal}} B</td></tr>
    </table>
    <JsonView v-if="expanded" :message="messageInfo.message"/>
  </div>
</template>

<script>
import {MessageInfoModel} from "@/fe/models/MessageInfoModel";
import {formatTime} from "@Lib/../../../lib/util/format";
import JsonView from "@/fe/components/JsonView";

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
.message-info {
  margin-bottom: .5em;
}
table {
  width: 100%;
  border-collapse: collapse;
}
td {
  border: 1px solid #777;
}
</style>
