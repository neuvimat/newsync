import {cloneDeep} from "lodash";

export const proxyKey = Symbol('proxy')
export const pristineKey = Symbol('pristine')
export const levelsKey = Symbol('levels')
export const container = Symbol('container')

/**
 * Creates a recursive proxy implementation. Returns the proxy itself, a pristine version of the proxied object
 * (pristine object is the direct unproxied reference => getters and setters are not monitored by the proxy for pristine
 * object) and object that tracks changes made to the object via proxy.
 *
 * To create a local change that is not propagated to/from the server, alter the pristine reference
 * @returns {{pristine: {}, proxy: {}, changes: {}}}
 */

// todo: Container might be completely useless here, let's see...
export function makeSimpleRecursiveProxy(dictionary, container) {
  const pristine = {}
  pristine[proxyKey] = true
  const changes = {}
  const lowPrioChanges = {}
  const proxy = new Proxy(pristine, makeSimpleHandler(changes, [], pristine, dictionary, lowPrioChanges))

  return {pristine, proxy, changes, lowPrioChanges}
}

function arrayHandler() {}

function createLowPrioHandler(level, pristine, dictionary, target, prop, lowPrioChanges) {
  const handler = {
    set: (key, value) => {
      let cursor = lowPrioChanges;
      for (let l of level) {
        if (!cursor[l]) {
          cursor[l] = {}
        }
        cursor = cursor[l]
      }
      cursor[key] = value
      target[key] = value
      return handler;
    },
    getLowPrioChanges() {
      return lowPrioChanges;
    }
  }
  return handler
}

function makeSimpleHandler(changes, level = [], pristine, dictionary, lowPrioChanges) {
  let recHandler
  recHandler = {
    get(target, prop, receiver) {
      if (prop === '$low') {
        return createLowPrioHandler(level, pristine, dictionary, target, prop, lowPrioChanges);
      }
      if (prop === 'toJSON') {return target[prop]} // todo: why is this here?
      if (typeof pristine[prop] === 'object' && !(Array.isArray(pristine[prop]))) {
        if (!target[prop][proxyKey]) {
          pristine[prop][proxyKey] = new Proxy(pristine[prop], makeSimpleHandler(changes, [...level, prop], pristine[prop], dictionary, lowPrioChanges))
        }
        return target[prop][proxyKey]
      }
      return pristine[prop]
    },
    set(target, prop, value) {
      target[prop] = value;
      let cursor = changes;
      for (let l of level) {
        if (!cursor[l]) {
          cursor[l] = {}
        }
        cursor = cursor[l]
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Just top level not being shallow copy should be enough, and it helps with performance not to deep clone all
        const newValue = {}
        for (let k of Object.keys(value)) {
          newValue[k] = value[k]
        }
        cursor[prop] = newValue
      }
      else {
        cursor[prop] = value
      }

      return true;
    }
  }

  return recHandler
}
