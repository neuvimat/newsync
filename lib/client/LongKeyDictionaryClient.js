import {LongKeyDictionaryServer} from "@Lib/server/LongKeyDictionaryServer";

/**
 * Client side version of the {@link LongKeyDictionaryServer}. Clients are disallowed from adding their own short keys to the
 * dictionary when they first encounter their long variant to keep them from desynchronizing their dictionary.
 */
export class LongKeyDictionaryClient extends LongKeyDictionaryServer {
  constructor(debug = false) {
    super()
  }

  init() {
    this._initKeys()
    this.shortenServer = this.shorten // Just in case we would need the old shorten
    this.shorten = (key) => {return this.toMap.get(key) || key} // Clients cannot add their own words in the dictionary
  }
}
