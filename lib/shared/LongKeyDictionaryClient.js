// noinspection DuplicatedCode

import {SimpleContainer} from "@Lib/client/container/SimpleContainer";

const CHARPOINTER_OFFSET = 200
const MAX_VALID_CHAR = 55295
const MAX_CHARPOINTER_VALUE = MAX_VALID_CHAR - CHARPOINTER_OFFSET

/**
 * Very similar to server version, but this one disallows to make changes to it
 */
export class LongKeyDictionaryClient {
  constructor(debug = false) {
    this.firstSymbol = String.fromCharCode(CHARPOINTER_OFFSET)
    this.toMap = new Map()
    this.fromMap = new Map()
    this.prefix = this.firstSymbol
    this.pointers = [0]
    this.debug = debug;
    this.container = new SimpleContainer()
    this.shorten('dictionary')
  }

  get last() {
    return this.pointers.length - 1
  }

  shorten(key) {
    return this.toMap.get(key) || key
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
    return this.toMap.get(key)
  }

  isShort(key) {
    return this.fromMap.has(key)
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
