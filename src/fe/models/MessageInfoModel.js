import {pack, unpack} from 'msgpackr'
import {INDICES, KEYWORDS} from "@Lib/shared/SYMBOLS";
import {cloneDeep} from "lodash";

/**
 * This model represents a message received from the NewSync framework. It also has a responsibility to calculate
 * the message size for all the possible variants of the message's formats.
 */
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
    const tmp = unpack(new Uint8Array(rawMessage))
    if (tmp[INDICES.containers]) {
      for (let c in tmp[INDICES.containers]) {
        tmp[INDICES.containers][c] = unpack(tmp[INDICES.containers][c])
      }
    }
    const message = this.dictionary.restoreObject(tmp)
    this.message = message

    const msgpackNoDictionary = cloneDeep(message)
    if (msgpackNoDictionary[INDICES.containers]) {
      for (let c in msgpackNoDictionary[INDICES.containers]) {
        msgpackNoDictionary[INDICES.containers][c] = pack(msgpackNoDictionary[INDICES.containers][c])
      }
    }

    this.lengthFinal = rawMessage.byteLength
    this.lengthNoDict = pack(msgpackNoDictionary).length
    this.lengthJsonNoDict = MessageInfoModel.encoder.encode(JSON.stringify(message)).length
    this.lengthJsonDict = MessageInfoModel.encoder.encode(JSON.stringify(this.dictionary.shortenObject(message))).length

    return {final: this.lengthFinal, noDict: this.lengthNoDict, jsonNoDict: this.lengthJsonNoDict, json: this.lengthJsonDict}
  }
}
