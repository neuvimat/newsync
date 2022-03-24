const proxyRef = Symbol('proxyRef')

/**
 * Creates a recursive proxy implementation. Returns the proxy itself, a pristine version of the proxied object
 * (pristine object is the direct unproxied reference => getters and setters are not monitored by the proxy for pristine
 * object) and object that tracks changes made to the object via proxy.
 *
 * To create a local change that is not propagated to/from the server, alter the pristine reference
 * @returns {{pristine: {}, proxy: {}, changes: {}}}
 */
export function makeRecursiveProxy() {
  const changes = {}
  const pristine = {}
  pristine[proxyRef] = true
  const proxy = new Proxy(pristine, makeHandler(changes, [], pristine))

  return {pristine, proxy, changes}
}

function makeHandler(changes, level = [], pristine) {
  let recHandler = {
    get(target, prop, receiver) {
      if (typeof pristine[prop] === 'object' && !(pristine[prop] instanceof Array)) {
        if (!target[prop][proxyRef]) {
          pristine[prop][proxyRef] = new Proxy(pristine[prop], makeHandler(changes, [...level, prop], pristine[prop]))
        }
        return target[prop][proxyRef]
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
      cursor[prop] = value

      return true;
    }
  }

  return recHandler
}
