/**
 * @module
 */

/**
 * Cleans the object, but does not create a new one (the reference remains the same).
 * @param object
 * @return {any}
 */
import {Arr} from "messagepack";
import {ALIAS} from "@Lib/shared/ALIAS";
import {APPLY_META_COMMANDS} from "@Lib/shared/proxies/ArrayMetaCommand";
import _ from "lodash";

/**
 * Checks whether a value is a typed array ({@link Int8Array}, {@link Int16Array} and so on ...)
 * @param value {*}
 * @return {boolean}
 */
export function isTypedArray(value) {
  return ArrayBuffer.isView(value)
}

/**
 * Checks whether a value is an {@link Array}
 * @param value {*}
 * @return {boolean}
 */
export function isArray(value) {
  return Array.isArray(value)
}

/**
 * Checks whether a value is either an {@link Array} or typed array (see {@link isTypedArray}).
 * @param value {*}
 * @return {boolean|*}
 */
export function isAnyArray(value) {
  return isArray(value) || isUntrackableArray(value)
}

/**
 * Check whether the value is untraceable array by NewSync.
 * @param value {*}
 * @return {boolean|arg is ArrayBufferView}
 */
export function isUntrackableArray(value) {
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value)
}

/**
 * Check whether the value is traceable array by NewSync.
 * @param value {*}
 * @return {boolean|arg is ArrayBufferView}
 */
export function isTrackableArray(value) {
  return Array.isArray(value)
}

/**
 * Check if value as an object and has any properties
 * @param obj {*}
 * @return {boolean} true if the value is an object and has any properties
 */
export function isNonEmptyObject(obj) {
  return (typeof obj === 'object' && !isEmpty(obj))
}

/**
 * Check if value is not an object or if it is, whether it has any properties
 * @param obj {*}
 * @return {boolean} true if the value is not an object or an object with zero own properties
 */
export function isEmpty(obj) {
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      return false
    }
  }
  return true;
}

/**
 * Removes all iterable properties from an object as a side effect (does not create a new object). Does not check for
 * own properties, if you need that, {@link clearOwn}.
 * @param object
 * @return {*}
 */
export function clear(object) {
  for (let k in object) {
    delete object[k]
  }
  return object
}

/**
 * Removes all iterable properties from an object as a side effect (does not create a new object). Checks wheter the
 * property is own to the object first. If you want to remove all, {@link clear}.
 * @param object
 * @return {*}
 */
export function clearOwn(object) {
  for (let k in object) {
    if (!object.hasOwnProperty(k)) continue;
    delete object[k]
  }
  return object
}

/**
 * Merges object b to object a (does not create a new instance, alters the existing object a). Properties of b overwrite
 * those of a, if the keys collide.
 * @param a {Object} target
 * @param b {Object} source
 * @return {any}
 */
export function merge(a, b) {
  if (a === undefined || a === null) a = {}
  if (b === undefined || b === null) b = {}
  recDeepMerge(a, b);
  return a;
}

function recDeepMerge(a, b) {
  for (let k in b) {
    if (b[k] instanceof Object && !(Array.isArray(b[k]))) {
      if (a[k] === undefined || !(a[k] instanceof Object)) {
        a[k] = {}
      }
      recDeepMerge(a[k], b[k])
    }
    else {
      a[k] = b[k]
    }
  }
}

/**
 * Returns a new object that contains only differences between two objects. The difference object contains updates
 * that have to be applied to old object in order to get the 'neu' object.
 * <b>Do NOT alter the diff object</b>, it may contain shallow copies of objects/arrays!
 *
 * Does not detect keys that should be removed from old to get to 'neu' object
 * @param old
 * @param neu Since new is a reserved keyword, use 'neu' instead
 */
export function difference(old, neu) {
  const diff = {}
  recDiff(old, neu, diff)
  return diff
}

function recDiff(old, neu, diff) {
  for (let k in neu) {
    if (neu[k] instanceof Object) {
      if ((neu[k] instanceof Array)) {
        if (!arraysEqual(neu[k], old[k])) {
          diff[k] = neu[k] // The diff object is not meant to be modified, use shallow copy for performance
        }
      }
      else {
        if (!(old[k] instanceof Object)) {
          diff[k] = neu[k] // The diff object is not meant to be modified, use shallow copy for performance
        }
        else {
          diff[k] = {}
          recDiff(old[k], neu[k], diff[k])
        }
      }
    }
    else {
      if (neu[k] !== old[k]) {
        diff[k] = neu[k]
      }
    }
  }
}

export function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * This is NewSync specific delete function that works with NewSync's specification of delete operations.
 *
 * The 'deletes' object is structured as an object with other nested objects. To allow specifying keys to be deleted
 * from the object and at the same time nesting other objects, the keys to be deleted from and object at that current
 * place is an array under the '*' key.
 */
export function applyDeletes(containerState, deletes) {
  if (deletes[ALIAS.KEY_DEL]) {
    for (const k of deletes[ALIAS.KEY_DEL]) {
      delete containerState[k]
    }
    delete deletes[ALIAS.KEY_DEL] // Delete it so the 'for in' does not go over this property
  }
  for (const key in deletes) {
    if (containerState[key]) {
      applyDeletes(containerState[key], deletes[key])
    }
  }
}

/**
 * This is NewSync specific function that applies miscellaneous operations based on the NewSync specification.
 *
 * The 'meta' object is structured as an object with other nested objects. To allow specifying keys to be altered
 * from the object and at the same time nesting other objects, the meta commands to be applied at that specific location
 * are in an array under the '*' key.
 */
export function applyMeta(containerState, meta, receiver, prop) {
  // We can reuse the KEY_DEL in this case because it will not collide with anything
  if (meta[ALIAS.KEY_DEL]) {
    APPLY_META_COMMANDS(meta[ALIAS.KEY_DEL], containerState, [...containerState], receiver, prop)
    delete meta[ALIAS.KEY_DEL] // Delete it so the 'for in' does not go over this property
  }
  for (const key in meta) {
    if (containerState[key]) {
      applyMeta(containerState[key], meta[key], containerState, key)
    }
  }
}
