// const CHARPOINTER_OFFSET = 123
const CHARPOINTER_OFFSET = 65
// const MAX_VALID_CHAR = 55295
const MAX_VALID_CHAR = 68
const MAX_CHARPOINTER_VALUE = MAX_VALID_CHAR - CHARPOINTER_OFFSET

export class LongKeyDictionary {
  constructor(debug = false) {
    this.firstSymbol = String.fromCharCode(CHARPOINTER_OFFSET)
    this.toMap = new Map()
    this.fromMap = new Map()
    this.prefix = this.firstSymbol
    this.pointers = [0]
    this.debug = debug;
  }

  get last() {
    return this.pointers.length - 1
  }

  generateNextShort() {
    let i = this.pointers.length - 2
    for (i; i >= 0; i--) {
      if (this.pointers[i+1] > MAX_CHARPOINTER_VALUE) {
        this.pointers[i]++
        this.pointers[i+1] = 0
      }
      else {
        break;
      }
    }
    i++
    if (this.pointers[0] > MAX_CHARPOINTER_VALUE) {
      this.pointers.fill(0).push(0)
      this.prefix = ''
      const symbol = String.fromCharCode(CHARPOINTER_OFFSET)
      for (let i = 0; i < this.pointers.length; i++) {
        this.prefix += symbol
      }
    }
    else {
      this.prefix = this.prefix.substring(0, i) + String.fromCharCode(this.pointers[i] + CHARPOINTER_OFFSET)
      this.prefix = this.prefix.padEnd(this.pointers.length, this.firstSymbol)
    }
    this.pointers[this.last]++
    return this.prefix;
  }

  get debug() {
    return this._debug
  }

  set debug(value) {
    value ? this.restore = this._restoreDebug : this.restore = this._restore
    this._debug = value
  }

  shorten(key) {
    // fixme: not effective, does not go through all permutations
    if (!this.toMap.has(key)) {
      let short = this.generateNextShort()
      this.toMap.set(key, short)
      this.fromMap.set(short, key)
      return short
    }
    return this.toMap.get(key)
  }

  getShort(key) {
    return this.toMap.get(key)
  }

  restore(key) {

  }

  _restore(key) {
    return this.fromMap.get(key)
  }

  _restoreDebug(key) {
    const value = this.fromMap.get(key)
    if (value === undefined) {
      console.error(`No valid full key found in LongKeyDictionary for shorthand '${key}'`);
    }
    else {
      return value
    }
  }

}
