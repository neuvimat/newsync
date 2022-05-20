/**
 * This test is to be run in Node.js environment. It tests the performance of many formats and prints out the results
 * into a stats.txt file.
 */

import * as tester from './lib/performTestNode.mjs'
import generateObject from "./lib/bigObjectGenerator.js";
import _ from 'lodash'
import {byteSize} from "../lib/format.mjs";

import {promises} from 'fs'

// BSON
import * as bsonext from 'bson-ext'
import * as bson from 'bson'

// CBOR
import * as cbor from 'cbor'
import cborjs from 'cbor-js'
import * as cborx from 'cbor-x'
import * as borc from 'borc'

// MessagePack
import msgpack from 'msgpack'
import * as messagepack from 'messagepack'
import * as msgpackr from 'msgpackr'
import * as msgpacklite from 'msgpack-lite'
import msgpack5 from 'msgpack5'
import msgpackjs from 'msgpack-js'

const randomNumberMaxValue = 5_000_000;
const small = generateObject(10, 20, 4, 10, randomNumberMaxValue)
const med = generateObject(190, 20, 4, 10, randomNumberMaxValue)
const big = generateObject(800, 30, 4, 25, randomNumberMaxValue)

tester.setTestIterations(10);
tester.addTestCase({label:'small', object:small})
tester.addTestCase({label:'med', object:med})
tester.addTestCase({label:'big', object:big})

console.log(cborx.isNativeAccelerationEnabled);
console.log(msgpackr.isNativeAccelerationEnabled);

tester.performTest('json', JSON.stringify, undefined, JSON.parse, undefined, (obj)=>{return (new TextEncoder().encode(obj).length)})
tester.performTest('bson-ext', bsonext.serialize, undefined, bsonext.deserialize, undefined, (obj)=>{return obj.length})
tester.performTest('bson', bson.serialize, undefined, bson.deserialize, undefined, (obj)=>{return obj.length})
tester.performTest('cbor', cbor.encodeOne, {highWaterMark: 1_000_000}, cbor.decodeFirstSync, undefined, (obj)=>{return obj.length})
tester.performTest('cborjs', cborjs.encode, undefined, cborjs.decode, undefined, (obj)=>{return obj.byteLength})
tester.performTest('cborx', cborx.encode, undefined, cborx.decode, undefined, (obj)=>{return obj.byteLength})
tester.performTest('borc', borc.encode, undefined, borc.decode, undefined, (obj)=>{return obj.byteLength})
tester.performTest('msgpack', msgpack.pack, undefined, msgpack.unpack, undefined, (obj)=>{return obj.byteLength})
tester.performTest('messagepack', messagepack.encode, undefined, messagepack.decode, undefined, (obj)=>{return obj.byteLength})
tester.performTest('msgpackr', msgpackr.encode, undefined, msgpackr.decode, undefined, (obj)=>{return obj.byteLength})
tester.performTest('msgpacklite', msgpacklite.encode, undefined, msgpacklite.decode, undefined, (obj)=>{return obj.byteLength})
const inst = msgpack5();
tester.performTest('msgpack5', inst.encode, undefined, inst.decode, undefined, (obj)=>{return obj.byteLength})
tester.performTest('msgpackjs', msgpackjs.encode, undefined, msgpackjs.decode, undefined, (obj)=>{return obj.byteLength})

const errors = tester.getErrors()
if (errors.length > 0) {
  console.error('There was an error detected!');
  console.error(errors);
  process.exit(-1)
}

let output = '';
const results = tester.getResults()

// Times
output += 'Performance [ms]\n'
for (let pkg in results) {
  output += `${pkg}:\n`
  for (let cas in results[pkg]) {
    output += results[pkg][cas]['ser'].join(', ') + '\n'
    output += results[pkg][cas]['des'].join(', ') + '\n'
  }
}

const JSON_size = {
  small: results['json']['small']['size'],
  med: results['json']['med']['size'],
  big: results['json']['big']['size']
}

// Sizes - machine readable
output += '\nFile size (machine):\n'
for (let pkg in results) {
  let arr = []
  for (let cas in results[pkg]) {
    arr.push(results[pkg][cas]['size'])
  }
  output += arr.join(', ') + ' - ' + pkg + '\n'
}

// Sizes - human
output += '\nFile size (human):\n'
for (let pkg in results) {
  output += `${pkg}:\n`
  for (let cas in results[pkg]) {
    output += `${byteSize(results[pkg][cas]['size'])} (${((results[pkg][cas]['size'] / JSON_size[cas]) * 100).toFixed(2)}%)\n`
  }
}

// Sizes - excel
output += '\nFile size (excel copypasta):\n'
for (let pkg in results) {
  let arr = []
  if (pkg === 'json') {
    for (let cas in results[pkg]) {
      arr.push(byteSize(results[pkg][cas]['size']))
    }
  }
  else {
    for (let cas in results[pkg]) {
      arr.push(((results[pkg][cas]['size'] / JSON_size[cas]) * 100).toFixed(2) + '%')
    }
  }
  output += arr.join(',') + '\n'
}

promises.writeFile('./stats.txt', output)
