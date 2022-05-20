/**
 * IDs of specific meta commands
 * @type {{setLength: number, setIndex: number, copyIndex: number}}
 */
const META_IDS = {
  setIndex: 0,
  copyIndex: 1,
  setLength: 2,
  // removeOne: 0,
  // removeArray: 1,
  // removeRange: 2,
  // removeStart: 3,
  // removeEnd: 4,
  // setArray: 6,
  // pushArray: 7,
  // sortArray: 8,
  // reverse: 9,
  // applyBitVector: 10,
  // applyReverseBitVector: 11,
}

/**
 * A factory that creates the meta commands.
 * @type {{setLength(*): [number,*], setIndex(*, *): [number,*,*], copyIndex(*, *): [number,*,*]}}
 */
export const META_COMMANDS_FACTORY = {
  setIndex(index, value) {
    return [META_IDS.setIndex, index, value]
  },
  copyIndex(from, to) {
    return [META_IDS.copyIndex, from, to]
  },
  setLength(newLength) {
    return [META_IDS.setLength, newLength]
  }
}

/**
 * Helper function that allows simple application of specified meta commands on a target array.
 * @param metaCommands
 * @param targetArray
 * @param origin
 * @param receiver
 * @param prop
 */
export function APPLY_META_COMMANDS(metaCommands, targetArray, origin, receiver, prop) {
  let i = 0;
  const l = metaCommands.length
  while (i < l) {
    i = META_COMMANDS_HANDLES[metaCommands[i]](i, metaCommands, targetArray, origin, receiver, prop)
  }
}

/**
 * This object contains special handler methods that correspond each to its own meta command id. These methods contain
 * implementation of how to apply the specific command to the target.
 */
export const META_COMMANDS_HANDLES = {
  [META_IDS.setIndex](i, c, t) {
    t[c[i+1]] = c[i+2]
    return i + 3;
  },
  [META_IDS.copyIndex](i,c,t,o) {
    t[c[i+2]] = o[c[i+1]]
    return i + 3
  },
  [META_IDS.setLength](i,c,t) {
    t.splice(c[i+1])
    return i + 2
  }
}
