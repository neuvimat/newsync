export const KEYWORDS_FROM = {
  a: 'messages',
  b: 'dictionary',
  c: 'containers',
  d: 'meta',
  e: 'events',
  f: 'lowPrio'
}
export const KEYWORDS_TO = {
  messages: 'a',
  dictionary: 'b',
  containers: 'c',
  meta: 'd',
  events: 'e',
  lowPrio: 'f'
}

// In case someone edits this and makes a mistake, make sure to notify them
function checkConsistency() {
  for (let k in KEYWORDS_FROM) {
    if (!(KEYWORDS_TO[KEYWORDS_FROM[k]] === k)) {
      throw new Error('Keywords are not consistent for key ' + KEYWORDS_FROM[k] + ' (' + k + ')')
    }
  }
}
checkConsistency()
