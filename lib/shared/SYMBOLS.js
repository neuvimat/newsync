export const KEYWORDS_FROM = {
  a: 'messages',    // user created messages
  b: 'dictionary',  // dictionary update
  c: 'containers',  // containers in the update
  d: 'meta',        // updates for the container in incremental form
  e: 'events',      // different way of user created messages - these throw events on the NewSyncClient/Server
  f: 'lowPrio',     // flag that says a message is a low priority one
  g: 'commands',    // NewSync commands use separate channel to prevent collision with user messages
  h: 'deletes',     // Array of deletion commands
}
export const KEYWORDS = {
  messages: 'a',
  dictionary: 'b',
  containers: 'c',
  meta: 'd',
  events: 'e',
  lowPrio: 'f',
  commands: 'g',
  deletes: 'h',
}
export const SYMBOLS = {
  sProxy: Symbol('proxy'),
  sPristine: Symbol('pristine'),
  sLevel: Symbol('levels'),
  sContainer: Symbol('container'),
  sHandler: Symbol('handler'),
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
