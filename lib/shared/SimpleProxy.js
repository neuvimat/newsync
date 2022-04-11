import {NeuSyncServer} from "@Lib/server/NeuSyncServer";
import {inspect} from "util";
import {Arr} from "messagepack";

const proxyKey = Symbol('proxyRef')

/**
 * Creates a recursive proxy implementation. Returns the proxy itself, a pristine version of the proxied object
 * (pristine object is the direct unproxied reference => getters and setters are not monitored by the proxy for pristine
 * object) and object that tracks changes made to the object via proxy.
 *
 * To create a local change that is not propagated to/from the server, alter the pristine reference
 * @returns {{pristine: {}, proxy: {}, changes: {}}}
 */
export function makeSimpleRecursiveProxy() {
  const changes = {}
  const pristine = {}
  pristine[proxyKey] = true
  const proxy = new Proxy(pristine, makeSimpleHandler(changes, [], pristine))

  return {pristine, proxy, changes}
}

function arrayHandler() {}

function makeSimpleHandler(changes, level = [], pristine) {
  let recHandler = {
    get(target, prop, receiver) {
      if (prop === 'toJSON') {return target[prop]} // todo: why is this here?
      if (typeof pristine[prop] === 'object' && !(Array.isArray(pristine[prop]))) {
        if (!target[prop][proxyKey]) {
          pristine[prop][proxyKey] = new Proxy(pristine[prop], makeSimpleHandler(changes, [...level, prop], pristine[prop]))
        }
        return target[prop][proxyKey]
      }
      return pristine[prop]
    },
    set(target, prop, value) {
      target[prop] = value;
      const shortProp = NeuSyncServer.dictionary.shorten(prop)
      let cursor = changes;
      for (let l of level) {
        const short = NeuSyncServer.dictionary.shorten(l)
        if (!cursor[short]) {
          cursor[short] = {}
        }
        cursor = cursor[short]
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Just top level not being shallow copy should be enough, and it helps with performance not to deep clone all
        const newValue = {}
        for (let k of Object.keys(value)) {
          newValue[k] = value[k]
        }
        cursor[shortProp] = newValue
      }
      else {
        cursor[shortProp] = value
      }

      return true;
    }
  }

  return recHandler
}
