import {NewSyncClient} from "@Lib/client/NewSyncClient";
import {WebSocketDriverClient} from "@Lib/client/drivers/WebSocketDriverClient";
import {LongKeyDictionaryClient} from "@Lib/shared/LongKeyDictionaryClient";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";

const driver = new WebSocketDriverClient('')
const dict = new LongKeyDictionaryClient()
const coder = new MessagePackCoder()

const ns = new NewSyncClient(driver, coder, dict)
const container = ns.addContainer('test', new SimpleContainer())

const array = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const changes = []
const proxy = new Proxy(array, makeSwapHandler(changes))

let tmp = proxy[3]
proxy[3] = proxy[1]
proxy[1] = tmp

// let sequnce = [get x, get y, set x, set y to value of x] // swap on handler detected

function mapSet(map, key, index) {
  const ref = map.get(key)
  if (!ref) {
    map.set(key, [index])
  }
  else {
    ref.push(index)
  }
}

/**
 *
 * @param arr1 the beginning state of an array
 * @param arr2 the final state of the array
 */
function hardCheckSwaps(arr1, arr2) {
  const swaps = []
  const news = []
  const deletes = []
  const map = new WeakMap()
  let jump = 0
  for (let i = 0; i < arr1.length; i++) {
    mapSet(map, arr1[i], i)
  }
  for (let i = 0; i < arr2; i++) {
    const info = map.get(arr2[i]);
    if (info) {
      if (info[0] === i) {
        // This is the same as before
        info.shift();
      }
      else {
        // Swap detected
        swaps.push([info[0], i]);
      }
    }
    else {
      // New object detected!
      const x = []
    }
    // We need to check deletions tho...
  }
}

let lastAccessedIndex = null
let lastSetIndex = null

function makeSwapHandler() {
  return {
    get(target, prop, receiver) {
      if (prop instanceof Number) {
        lastAccessedIndex = prop
      }
      return target[prop]
    },
    set(target, prop, value) {

      target[prop] = value
    }
  }
}
