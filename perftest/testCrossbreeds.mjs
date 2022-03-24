import msgpack from "msgpack";
import * as msgpackr from "msgpackr";
import _ from "lodash";
import generateObject from "../lib/bigObjectGenerator.js";
import * as msgpacklite from 'msgpack-lite'

const small = generateObject(10, 20, 4, 10)
const med = generateObject(190, 20, 4, 10)
const big = generateObject(800, 30, 4, 25)

// Test if different implementations that produce different sized records are still compatible with each other

// ============== SMALL OBJECT TEST
console.log('=========== SMALL OBJECT ========');
let msgpack_S_S = msgpack.pack(small)
let msgpackr_S_S = msgpackr.encode(small)
let msgpack_S_D = msgpack.unpack(msgpack_S_S)
let msgpackr_S_D = msgpackr.decode(msgpackr_S_S)

console.log('Is coded & decoded msgkpack equal to original object?',_.isEqual(msgpack_S_D, small))
console.log('Is coded & decoded msgkpackr equal to original object?',_.isEqual(msgpackr_S_D, small))
console.log('Byte size of serialized msgpack:',msgpack_S_S.length);
console.log('Byte size of serialized msgpack:',msgpackr_S_S.length);

let cross1 = msgpack.unpack(msgpackr_S_S)
let cross2 = msgpackr.decode(msgpack_S_S)
let cross3 = msgpacklite.decode(msgpack_S_S)

console.log('Is msgpackr message decoded by msgpack equal to original object?',_.isEqual(cross1, small))
console.log('Is msgpack message decoded by msgpackr equal to original object?',_.isEqual(cross2, small))
console.log('Is msgpack message decoded by msgpacklite equal to original object?',_.isEqual(cross3, small))

// ============== MED OBJECT TEST
console.log('=========== MEDIUM OBJECT ========');
let msgpack_M_S = msgpack.pack(med)
let msgpackr_M_S = msgpackr.encode(med)
let msgpack_M_D = msgpack.unpack(msgpack_M_S)
let msgpackr_M_D = msgpackr.decode(msgpackr_M_S)

console.log('Is coded & decoded msgkpack equal to original object?',_.isEqual(msgpack_M_D,med))
console.log('Is coded & decoded msgkpackr equal to original object?',_.isEqual(msgpackr_M_D,med))
console.log('Byte size of serialized msgpack:',msgpack_M_S.length);
console.log('Byte size of serialized msgpack:',msgpackr_M_S.length);

let cross1_m = msgpack.unpack(msgpackr_M_S)
let cross2_m = msgpackr.decode(msgpack_M_S)
let cross3_m = msgpacklite.decode(msgpack_M_S)

console.log('Is msgpackr message decoded by msgpack equal to original object?',_.isEqual(cross1_m,med))
console.log('Is msgpack message decoded by msgpackr equal to original object?',_.isEqual(cross2_m,med))
console.log('Is msgpack message decoded by msgpacklite equal to original object?',_.isEqual(cross3_m, med))

// ============== BIG OBJECT TEST
console.log('=========== BIG OBJECT ========');
let msgpack_L_S = msgpack.pack(big)
let msgpackr_L_S = msgpackr.encode(big)
let msgpack_L_D = msgpack.unpack(msgpack_L_S)
let msgpackr_L_D = msgpackr.decode(msgpackr_L_S)

console.log('Is coded & decoded msgkpack equal to original object?',_.isEqual(msgpack_L_D, big))
console.log('Is coded & decoded msgkpackr equal to original object?',_.isEqual(msgpackr_L_D, big))
console.log('Byte size of serialized msgpack:',msgpack_L_S.length);
console.log('Byte size of serialized msgpack:',msgpackr_L_S.length);

let cross1_l = msgpack.unpack(msgpackr_L_S)
let cross2_l = msgpackr.decode(msgpack_L_S)
let cross3_l = msgpacklite.decode(msgpack_L_S)

console.log('Is msgpackr message decoded by msgpack equal to original object?',_.isEqual(cross1_l, big))
console.log('Is msgpack message decoded by msgpackr equal to original object?',_.isEqual(cross2_l, big))
console.log('Is msgpack message decoded by msgpacklite equal to original object?',_.isEqual(cross3_l, big))
