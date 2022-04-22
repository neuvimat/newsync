import {pack, unpack} from 'msgpackr'
import {KEYWORDS} from "@Lib/shared/SYMBOLS";
import {cloneDeep} from "lodash";

export class MessageInfoModel {
  static encoder = new TextEncoder()
  static decoder = new TextDecoder()
  dictionary
  message
  lengthFinal
  lengthNoDict
  lengthJsonDict
  lengthJsonNoDict

  constructor(rawMessage, dictionary, id, time) {
    this.id = id
    this.time = time
    this.dictionary = dictionary
    this.doStuff(rawMessage)
  }

  doStuff(rawMessage) {
    console.log('doing stuff with', rawMessage);
    const msg = unpack(rawMessage)
    console.log('unpack succ');
    if (msg[KEYWORDS.containers]) {
      for (let c in msg[KEYWORDS.containers]) {
        msg[KEYWORDS.containers][c] = unpack(msg[KEYWORDS.containers][c])
      }
    }
    const rstrd = this.dictionary.restoreObject(msg)
    this.message = rstrd

    this.lengthFinal = rawMessage.length
    const msgpackrestored = cloneDeep(rstrd)
    if (msgpackrestored[KEYWORDS.containers]) {
      for (let c in msgpackrestored[KEYWORDS.containers]) {
        console.log('c', c);
        msgpackrestored[KEYWORDS.containers][c] = pack(msgpackrestored[KEYWORDS.containers][c])
      }
    }
    this.lengthNoDict = pack(msgpackrestored).length
    this.lengthJsonNoDict = MessageInfoModel.encoder.encode(JSON.stringify(rstrd)).length
    this.lengthJsonDict =   MessageInfoModel.encoder.encode(JSON.stringify(this.dictionary.shortenObject(cloneDeep(rstrd)))).length

    console.log('msgpackrestored', msgpackrestored);
  }
}
