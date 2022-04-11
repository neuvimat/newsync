import {SimpleContainer} from "@Lib/client/container/SimpleContainer";

const INITIAL_WORDS = ['dictionary', 'containers']
const CHARPOINTER_OFFSET = 200
const MAX_VALID_CHAR = 55295
const MAX_CHARPOINTER_VALUE = MAX_VALID_CHAR - CHARPOINTER_OFFSET

export class LongKeyDictionaryServer {
  // These static variables are here, so we can access these in the client version of the dictionary
  // But we keep defining them in this one file for better consistency
  static INITIAL_WORDS = INITIAL_WORDS
  static CHARPOINTER_OFFSET = CHARPOINTER_OFFSET
  static MAX_VALID_CHAR = MAX_VALID_CHAR
  static MAX_CHARPOINTER_VALUE = MAX_VALID_CHAR - CHARPOINTER_OFFSET

  constructor(debug = false) {
    this.firstSymbol = String.fromCharCode(CHARPOINTER_OFFSET)
    this.toMap = new Map()
    this.fromMap = new Map()
    this.prefix = this.firstSymbol
    this.pointers = [0]
    this.debug = debug;
    this.changes = {}
    this.init()
  }

  init() {
    this._initKeys()
  }

  _initKeys() {
    for (let word of LongKeyDictionaryServer.INITIAL_WORDS) {
      this.shorten(word)
    }
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


  shorten(key) {
    if (!this.toMap.has(key)) {
      let short = this.generateNextShort()
      this.toMap.set(key, short)
      this.fromMap.set(short, key)
      this.changes[key] = short
      return short
    }
    return this.toMap.get(key)
  }

  shortenObjectReference(object) {
    for (let key in object) {
      // Short keys should be unique and never appearing again, even as un-shortened version, thus we can safely skip
      if (!this.isShort(key)) {
        object[this.shorten(key)] = object[key]
        if (typeof object[key] === 'object' && !(object[key] instanceof Array)) {
          this.shortenObject(object[key])
        }
        delete object[key]
      }
    }
    return object // return for simpler chaining
  }

  shortenObject(object, copy = {}) {
    for (let key in object) {
      if (!object.hasOwnProperty(key)) continue
      if (!this.isShort(key)) {
        if (typeof object[key] === 'object' && !(object[key] instanceof Array)) {
          const objectCopy = this.shortenObject(object[key])
          copy[this.shorten(key)] = objectCopy
        }
        else {
          copy[this.shorten(key)] = object[key]
        }
      }
    }
    return copy
  }

  getShort(key) {
    return this.toMap.get(key) || key
  }

  updateShorts(updateObject) {
    for (let k in updateObject) {
      this.forceSetShort(k, updateObject[k])
    }
  }

  forceSetShort(long, short) {
    this.toMap.set(long, short)
    this.fromMap.set(short, long)
  }

  forceSetShortChange(long, short) {
    this.forceSetShort(long, short)
    this.container.changes[long] = short
  }

  isShort(key) {
    return this.fromMap.has(key)
  }

  restoreObject(object) {
    let restored = {}
    for (let key of Object.keys(object)) {
      if (typeof object[key] === 'object' && !Array.isArray(object[key])) {
        restored[this.restore(key)] = this.restoreObject(object[key])
      }
      else {
        restored[this.restore(key)] = object[key]
      }
    }
    return restored
  }

  restore(key) {} // get assigned dynamically

  get debug() {
    return this._debug
  }

  set debug(value) {
    value ? this.restore = this._restoreDebug : this.restore = this._restore
    this._debug = value
  }

  _restore(key) {
    return this.fromMap.get(key) || key
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
