export default function() {
  const array = []
  const proxy = createArrayHandler(array)

  const myContainer = new Proxy({array:proxy}, {
    get(target, prop, receiver) {
      console.log('container get is first?');
      return target[prop]
    },
    set(target, prop, value) {
      console.log('Setting', prop, target[prop], value);
      console.log(target[prop] == lastArrayFilteredOriginal);
      console.log(value == lastArrayFilteredResult);
      if (target[prop] == lastArrayFilteredOriginal && value == lastArrayFilteredResult) {
        console.log('looks good, storing changes');
      }
      target[prop] = value
      return true;
    }
  })
  const myContainerChanges = {}

  proxy.push(1)
  proxy.push(2)
  proxy.push(3)
  proxy.push(4)
  proxy.push(5)
  proxy.push(1)
  proxy.push(2)
  proxy.push(3)
  proxy.push(4)
  proxy.push(5)
  proxy.push(6)
  proxy.push(7)
  proxy.push(8)
  proxy.push(9)

  console.log('myContainer.array', myContainer.array);

  myContainer.array = myContainer.array.filter((e)=>{
    return e > 4
  })

  console.log('proxy', proxy);
  console.log('myContainer.array', myContainer.array);
}

// When we try to get push, map, foreach etc...
// Return not that function but our wrapped counterpart
// Inside there, wrap the fn argument to a proxy
// wrap that once more to store the results of filter, map, etc.
// Sort - advanced - send the function itself? Have some basic functions ready with IDs?

// Push - does not need to be wrapped?

// make use of single thread
let lastArrayFilteredOriginal = null
let lastArrayFilteredResult = null
let lastArrayFilteredChanges = null

function createArrayHandler(array) {
  function pushWrap(obj) {
    const result = array.push(obj)
  }

  function filterWrap(filterFn, newThis) {
    const changes = []
    newThis = newThis ? newThis : array
    const na = array.filter((element, index, array)=>{
      const result = filterFn.call(newThis, element, index, array)
      if (result) {
        changes.push('-'+index)
      }
      return result
    }, newThis)
    console.log('changes', changes);
    lastArrayFilteredResult = createArrayHandler(na)
    lastArrayFilteredChanges = changes
    return lastArrayFilteredResult;
  }

  const selfProxy = new Proxy(array, {
    get(target, prop, receiver) {
      switch (prop) {
        case 'push':
          return pushWrap
        case 'filter':
          lastArrayFilteredOriginal = selfProxy
          return filterWrap
        default:
          return target[prop]
      }
    },
  })
  return selfProxy
}
