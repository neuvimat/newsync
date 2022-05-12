/**
 * Checks for JSON unprintable characters or characters longer than 3B
 */

import {pack} from 'msgpackr'

for (let i = 40; i < 100_000; i++) {
  let char = String.fromCharCode(i)
  let json = JSON.stringify(char)
  let mpackLength = pack(char).length
  if (mpackLength > 4) {
    console.log('Character longer than 3B!!!',i, char, json.length, mpackLength);
  }
  if (json.length > 3) {
    console.log('JSON unprintable character!!!',i, char, json.length, mpackLength);
  }
}
console.log('done');
