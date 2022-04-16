import {Packr, Unpackr} from 'msgpackr'
import {isNonEmptyObject} from "@Lib/objUtil";

export class MessagePackCoder {
  constructor(packrOptions, unPackrOptions) {
    this.packr = isNonEmptyObject(packrOptions) ? new Packr(packrOptions) : new Packr({useRecords: true})
    this.unpackr = isNonEmptyObject(unPackrOptions) ? new Unpackr(unPackrOptions) : new Packr({useRecords: true})
  }

  pack(data) {
    return this.packr.pack(data)
  }

  unpack(data) {
    return this.unpackr.unpack(data)
  }
}
