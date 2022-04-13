/**
 * Cleans the object, but does not create a new one (the reference remains the same).
 * @param object
 * @return {any}
 */
import {Arr} from "messagepack";

export function isEmpty(obj) {
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      return false
    }
  }
  return true;
}

export function clear(object) {
  for (let k in object) {
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
  if (a === undefined) a = {}
  if (b === undefined) b = {}
  recDeepMerge(a, b);
  return a;
}

// todo: handle array merge, unless it gets handled inside proxies and containers somehow
// todo: move merginf from client/server to containers

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
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
