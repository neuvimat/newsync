<template>
  <div>
    <div :class="{hidden: revealStatus === 0, shown: revealStatus === 1, full: revealStatus === 2}" class="messages">
      <div class="header">Received messages</div>
      <div class="opener" @click="revealStatus = revealStatus === 0 ? 2 : 0">{{ revealStatus === 0 ? '<' : '>' }}</div>
      <div style="overflow: auto; height: 100%">
        <MessageInfo v-for="message in messages" :message-info="message"/>
      </div>
    </div>
  </div>
</template>

<script>
import MessageInfo from "@/fe/components/MessageInfo";
import {pack} from "msgpackr";
import {MessageInfoModel} from "@/fe/models/MessageInfoModel";
import {FakeLongKeyDictionary} from "@Lib/shared/FakeLongKeyDictionary";

export default {
  name: "Messages",
  components: {MessageInfo},
  data() {
    return {revealStatus: 2}
  },
  computed: {
    messages() {
      return this.$store.state.receivedMessages
    }
  },
  mounted() {

  }
}
</script>

<style scoped>
.header {
  font-size: 1.3rem;
  font-weight: bold;
}
.opener {
  border-radius: .4em 0 0 .4em;
  border: 1px solid #444;
  border-right: 0;
  text-align: center;
  width: 14px;
  padding: 1em 0;
  top: 50%;
  right: 100%;
  position: absolute;
  background-color: #ffffff;
}

.messages {
  padding: 0 0 0 .25em;
  border-left: 1px solid #444;
  width: 25vw;
  min-width: 380px;
  z-index: 500000;
  background-color: white;
  right: 0;
  top: 0;
  bottom: 20px;
  position: fixed;
  transition: all 250ms;
  /*overflow: auto;*/
}

.messages.hidden {
  transform: translateX(100%);
}

.messages.shown {

}

.messages.full {
  transform: translateX(0%);
}
</style>
