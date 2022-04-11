import {Packr, Unpackr} from 'msgpackr'

export class MessagePackCoder {
  constructor() {
    this.packr = new Packr()
    this.unpackr = new Unpackr()
  }

  pack(data) {
    return this.packr.pack(data)
  }

  unpack(data) {
    return this.unpackr.unpack(data)
  }
}
