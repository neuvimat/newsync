import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";

export class FakeLongKeyDictionary {
  constructor(debug = false) {
    this.container = {proxy: {}, changes: {}, pristine: {}}
  }

  get last() {
    return 0
  }

  shorten(key) {
    return key
  }

  shortenObjectReference(object) {
    return object // return for simpler chaining
  }

  shortenObject(object, ...args) {
    return object
  }

  getShort(key) {
    return key
  }

  isShort(key) {
    return true
  }

  restore(key) {} // get assigned dynamically

  restoreObject(object) {
    return object
  }

  get debug() {
    return false
  }

  set debug(value) {
  }

  _restore(key) {
    return key
  }

  _restoreDebug(key) {
    return key
  }
}