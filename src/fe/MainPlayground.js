import {ObjectContainer} from "@Lib/shared/containers/ObjectContainer";
import {pack} from 'msgpackr'
import {clear} from "@Lib/objUtil";

import * as _ from 'lodash'
import assert from "assert";
import {fullCompare} from "@Lib/shared/proxies/ObjectProxyHandler";

window._ = _

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
const b = {one: 1, two: 'two', three: {x: 15, c:25}}

const array1 = [a,b,5,6,7,8,9]
const array2 = [b,b,5,6,11,7,9]

const result = fullCompare(array2, array1)
