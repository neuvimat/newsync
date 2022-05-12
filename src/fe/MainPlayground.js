import {ObjectContainer} from "@Lib/shared/containers/ObjectContainer";
import {pack, unpack} from 'msgpackr'
import {clear} from "@Lib/objUtil";


import * as x from 'arraydiff'
import * as y from 'fast-array-diff'
import * as z from 'jsondiffpatch'

import * as _ from 'lodash'
import assert from "assert";
import {fullCompare} from "@Lib/shared/proxies/ObjectProxyHandler";
import {byteSize} from "@Lib/format.mjs";

window._ = _
window.byteSize = byteSize

const obj1 = {one: 1, two: 'two', thre: [1, 2, 3], nest: {a: 15}}
const obj2 = {lolec: 'true', akafuka: true, nested: {arrayszs: [1, 2, 3]}, sivt: [6, 9]}

const arr1 = [obj2, obj1]
const arr2 = [obj1, obj2, obj2]

console.log('x', x(arr1, arr2));
console.log('y', y.diff(arr1, arr2));
console.log('y', y.getPatch(arr1, arr2));
console.log('z', z.diff(arr1, arr2))
console.log('z2', z.patch([...arr1], z.diff(arr1,arr2)))

const patch = y.getPatch(arr1,arr2)
console.log('patch', patch);
let arr = [...arr1]
arr = y.applyPatch(arr, patch)
console.log('arr', arr);

const proxyE = document.getElementById('proxy');
const simE = document.getElementById('sim');
const changesE = document.getElementById('changes');
const clearE = document.getElementById('clear');

// const c = new ObjectContainer()
// c.proxy.a = {array: ['a', 'b', 'c']}
// c.propagateChanges()
//
// console.log('============= juicy stuff');
//
// c.proxy.a.array = c.proxy.a.array.filter((e)=>{return e === 'b'})
//
// console.log(c.proxy.a.array);
//
// console.log('PUSH');
// c.proxy.a.array.push(5)
//
// console.log(c.proxy.a.array);

const a = {lol: 15, wth: 'what the hell', nest: {egg: 2, species: 'ostrich'}}
const b = {one: 1, two: 'two', three: {x: 15, c: 25}}

const array1 = [a, b, 5, 6, 7, 8, 9]
const array2 = [b, b, 5, 6, 11, 7, 9]

// const c = new ObjectContainer()
// c.proxy.a = array1
// c.proxy.b = array2

const result = fullCompare(array2, array1)
console.log('result', result);
