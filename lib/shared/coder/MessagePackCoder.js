import {Packr, Unpackr} from 'msgpackr'
import {isNonEmptyObject} from "@Lib/util/objUtil";
import {ICoder} from "@Lib/shared/coder/ICoder";

/**
 * @implements ICoder
 */
export class MessagePackCoder extends ICoder {
  newSync

  constructor(packrOptions, unPackrOptions) {
    super()
    this.packr = isNonEmptyObject(packrOptions) ? new Packr(packrOptions) : new Packr({useRecords: false})
    this.unpackr = isNonEmptyObject(unPackrOptions) ? new Unpackr(unPackrOptions) : new Packr({useRecords: false})
  }

  pack(data) {
    return this.packr.pack(data)
  }

  unpack(data) {
    return this.unpackr.unpack(data)
  }

  code(data) {
    this.pack(data)
  }

  decode(data) {
    this.unpack(data)
  }
}
