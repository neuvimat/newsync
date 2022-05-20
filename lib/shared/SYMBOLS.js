/**
 * @module
 */

/**
 * Internal dictionary of short keys to their long variants. Used for specific keywords inside NewSync synchronization
 * messages.
 *
 * Currently, obsoleted by new system of {@link INDICES}
 * @enum {string}
 */
export const KEYWORDS_FROM = {
  /** @member {string} */
  a: 'messages',    // user created messages
  /** @member {string} text */
  b: 'dictionary',  // dictionary update
  c: 'containers',  // containers in the update
  d: 'meta',        // updates for the container in incremental form
  e: 'events',      // different way of user created messages - these throw events on the NewSyncClient/Server
  f: 'lowPrio',     // flag that says a message is a low priority one
  g: 'commands',    // NewSync commands use separate channel to prevent collision with user messages
  h: 'deletes',     // Array of deletion commands
  i: 'merges',     // Array of deletion commands
  j: 'replaces',     // Array of deletion commands
}

/**
 * Internal dictionary of long keys to their short variants. Used for specific keywords inside NewSync synchronization
 * messages.
 *
 * Currently, obsoleted by new system of {@link INDICES}
 * @readonly
 * @enum {string}
 */
export const KEYWORDS = {
  messages: 'a',
  dictionary: 'b',
  containers: 'c',
  meta: 'd',
  events: 'e',
  lowPrio: 'f',
  commands: 'g',
  deletes: 'h',
  merges: 'i',
  replaces: 'j',
}

/**
 * Internal map of indices to what they represent. Used to minimize messages size by utilizing arrays with indices
 * instead of key-value pairs.
 * @readonly
 * @enum {string}
 */
export const INDICES = {
  // Top level synchronization message
  containers: 0,
  events: 1,
  messages: 2,
  dictionary: 3,
  commands: 4,
  lowPrio: 5,
  // Inside containers
  merges: 0,
  deletes: 1,
  replaces: 2,
  meta: 3,
}

export const META = {

}

/**
 * List of all symbols that can be used on a proxy reference to access some special, non-serializable properties.
 * @readonly
 * @enum {string}
 */
export const SYMBOLS = {
  sProxy: Symbol('proxy'),
  sPristine: Symbol('pristine'),
  sLevel: Symbol('levels'),
  sContainer: Symbol('container'),
  sHandler: Symbol('handler'),
  sLow: Symbol('low'),
  sChain: Symbol('chain'), // array chain
}

// In case someone edits this and makes a mistake, make sure to notify them
function checkConsistency() {
  for (let k in KEYWORDS_FROM) {
    if (!(KEYWORDS[KEYWORDS_FROM[k]] === k)) {
      throw new Error('Keywords are not consistent for key ' + KEYWORDS_FROM[k] + ' (' + k + ')')
    }
  }
}
checkConsistency()
