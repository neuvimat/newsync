/**
 * Cleans the object, but does not create a new one (the reference remains the same).
 * @param object
 * @return {any}
 */
import {Arr} from "messagepack";

export function isTypedArray(obj) {
  return ArrayBuffer.isView(obj)
}

export function isArray(obj) {
  return Array.isArray(obj)
}

export function isAnyArray(obj) {
  return isArray(obj) || isUntrackableArray(obj)
}

export function isUntrackableArray(obj) {
  return obj instanceof ArrayBuffer || ArrayBuffer.isView(obj)
}

export function iteratableProperties(obj) {
  return obj instanceof Object && !isArray(obj) && !isUntrackableArray(obj)
}

export function isTrackableArray(obj) {
  return Array.isArray(obj)
}

export function isNonEmptyObject(obj) {
  return (typeof obj === 'object' && !isEmpty(obj))
}

/**
 * @param obj
 * @return {boolean} true if the object has zero own properties
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
 * Merges object b to object a. Properties of b overwrite those of a, if the keys collide.
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
 * This is NewSync specific delete function and works with NewSync's specification of delete operations
 */
export function applyDeletes(containerState, deletes) {
  if (deletes['*']) {
    for (const k of deletes['*']) {
      delete containerState[k]
    }
    delete deletes['*'] // Delete it so the 'for in' does not go over this property
  }
  for (const key in deletes) {
    if (containerState[key]) {
      applyDeletes(containerState[key], deletes[key])
    }
  }
}

/**
 * This is NewSync specific function that applies miscellaneous operations base on the NewSync specification
 */
export function applyMeta(containerState, meta) {

}
