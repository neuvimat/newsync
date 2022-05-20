import {isAnyArray, isArray, isTrackableArray} from "@Lib/util/objUtil";

const CHARPOINTER_OFFSET = 200
const MAX_VALID_CHAR = 55295
const MAX_CHARPOINTER_VALUE = MAX_VALID_CHAR - CHARPOINTER_OFFSET

/**
 * Server side long key dictionary. It translates long keys to short by using characters that are very unlikely to be
 * used in regular key naming conventions.
 */
export class LongKeyDictionaryServer {
  // These static variables are here, so we can access these in the client version of the dictionary
  // But we keep defining them in this one file for better consistency
  static CHARPOINTER_OFFSET = CHARPOINTER_OFFSET
  static MAX_VALID_CHAR = MAX_VALID_CHAR
  static MAX_CHARPOINTER_VALUE = MAX_VALID_CHAR - CHARPOINTER_OFFSET

  constructor(minKeyLength = 3) {
    this.firstSymbol = String.fromCharCode(CHARPOINTER_OFFSET)
    this.toMap = new Map()
    this.fromMap = new Map()
    this.prefix = this.firstSymbol
    this.pointers = [0]
    this.changes = {}
    this.minKeyLength = minKeyLength
    this.currentLength = 2;
    this.te = new TextEncoder()
    this.init()
  }

  /**
   * Initialize the dictionary
   */
  init() {
    this._initKeys()
  }

  /**
   * Obsoleted by the usage of {@link INDICES}
   * @private
   */
  _initKeys() {

  }

  get last() {
    return this.pointers.length - 1
  }

  /**
   * Generate next available short key
   * @return {string} short key
   */
  generateNextShort() {
    let i = this.pointers.length - 2
    for (i; i >= 0; i--) {
      if (this.pointers[i + 1] > MAX_CHARPOINTER_VALUE) {
        this.pointers[i]++
        this.pointers[i + 1] = 0
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
    this.minKeyLength = this.te.encode(this.prefix).length
    return this.prefix;
  }

  /**
   * Return the short version of the key. If the short version already exists, directly returns it, otherwise creates
   * the short key and then returns it.
   * @param key {string}
   * @return {string}
   */
  shorten(key) {
    if (key.length < this.minKeyLength) {return key}
    if (!this.toMap.has(key)) {
      let short = this.generateNextShort()
      this.toMap.set(key, short)
      this.fromMap.set(short, key)
      this.changes[key] = short
      return short
    }
    return this.toMap.get(key)
  }

  /**
   * Shortens all the keys inside and object <b>by reference</b>, i.e. in place!
   * @param object {{}} object to shorten
   * @return {{}} the same object but will all keys replaced by the short ones
   */
  shortenObjectReference(object) {
    for (let key in object) {
      if (!object.hasOwnProperty(key)) continue
      const short = this.shorten(key)
      if (key !== short) {
        // Reassign the value to the short key and delete the long key
        object[short] = object[key]
        if (object[key] instanceof Object && !isAnyArray(object[key])) {
          this.shortenObjectReference(object[key])
        }
        delete object[key]
      }
      else {
        // Check if the key is does not host an object
        if (object[key] instanceof Object && !isAnyArray(object[key])) {
          this.shortenObjectReference(object[key])
        }
      }
    }
    return object // return for simpler chaining
  }

  /**
   * Similar to {@link shortenObjectReference}, but creates a copy of the object (shallow copy).
   * @param object {{}} object to copy and shorten
   * @param copy {{}} do not put anything here, autofilled by recursive calls
   * @return {{}}
   */
  shortenObject(object, copy = {}) {
    if (Array.isArray(object)) return object;

    for (let key in object) {
      if (!object.hasOwnProperty(key)) continue
      const short = this.shorten(key)
      if (key !== short || this.isShort(key)) {
        if (object[key] instanceof Object && !isAnyArray(object[key])) {
          const objectCopy = this.shortenObject(object[key])
          copy[short] = objectCopy
        }
        else {
          copy[short] = object[key]
        }
      }
    }
    return copy
  }

  /**
   * Get short version of the key, or the key itself if it does not have a short variant.
   * @param key {string}
   * @return {string}
   */
  getShort(key) {
    return this.toMap.get(key) || key
  }

  /**
   * Forces update of the dictionary by the key-value pairs. Key represents a long key, value its short form. The changes
   * do not trigger any synchronization mechanism
   * @param updateObject {object} object containing the changes
   */
  updateShorts(updateObject) {
    for (let k in updateObject) {
      this.forceSetShort(k, updateObject[k])
    }
  }

  /**
   * Forces an update to dictionary without creating a synchronizable change.
   * @param long {string}
   * @param short {string}
   */
  forceSetShort(long, short) {
    this.toMap.set(long, short)
    this.fromMap.set(short, long)
  }

  /**
   * Similar to {@link forceSetShort}, but logs the change for synchronization
   * @param long {string}
   * @param short {string}
   */
  forceSetShortChange(long, short) {
    this.forceSetShort(long, short)
    this.changes[long] = short
  }

  /**
   * Return if the key is short and not to be translated
   * @param key
   * @return {boolean}
   */
  isShort(key) {
    return key.length < this.minKeyLength
  }

  /**
   * Check if the key is in its short form and has associated a long key with it.
   * @param key {string}
   * @return {boolean}
   */
  isTranslated(key) {
    return this.fromMap.has(key)
  }

  /**
   * Find all short keys inside an object and restores them to their full variant
   * @param object {object}
   * @return {object}
   */
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

  /**
   * Return the full variant of the short key if it can be translated, or the key itself if no record exists for it in
   * the dictionary
   * @param key {string}
   * @return {string}
   */
  restore(key) {
    return this.fromMap.get(key) || key
  }
}
