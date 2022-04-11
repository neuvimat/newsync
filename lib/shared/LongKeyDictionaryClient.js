import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";

export class LongKeyDictionaryClient extends LongKeyDictionaryServer {
  constructor(debug = false) {
    super()
  }

  init() {
    this._initKeys()
    this.shortenServer = this.shorten // Just in case we would need the old shorten
    this.shorten = (key) => {return this.toMap.get(key) || key}
  }
}
