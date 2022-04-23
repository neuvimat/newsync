import {pack, unpack} from 'msgpackr'
import {KEYWORDS} from "@Lib/shared/SYMBOLS";
import {cloneDeep} from "lodash";
import {byteSize} from "@Lib/format.mjs";

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
    this.analyzeRawMessage(rawMessage)
  }

   /** @returns {{jsonNoDict, noDict, final, json}} */
  analyzeRawMessage(rawMessage) {
    const tmp = unpack(rawMessage)
    if (tmp[KEYWORDS.containers]) {
      for (let c in tmp[KEYWORDS.containers]) {
        tmp[KEYWORDS.containers][c] = unpack(tmp[KEYWORDS.containers][c])
      }
    }
    const message = this.dictionary.restoreObject(tmp)
    this.message = message

    const msgpackNoDictionary = cloneDeep(message)
    if (msgpackNoDictionary[KEYWORDS.containers]) {
      for (let c in msgpackNoDictionary[KEYWORDS.containers]) {
        msgpackNoDictionary[KEYWORDS.containers][c] = pack(msgpackNoDictionary[KEYWORDS.containers][c])
      }
    }

    this.lengthFinal = byteSize(rawMessage.length)
    this.lengthNoDict = byteSize(pack(msgpackNoDictionary).length)
    this.lengthJsonNoDict = byteSize(MessageInfoModel.encoder.encode(JSON.stringify(message)).length)
    this.lengthJsonDict = byteSize(MessageInfoModel.encoder.encode(JSON.stringify(this.dictionary.shortenObject(message))).length)

    return {final: this.lengthFinal, noDict: this.lengthNoDict, jsonNoDict: this.lengthJsonNoDict, json:this.lengthJsonDict}
  }
}
