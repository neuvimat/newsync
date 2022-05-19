// import * as assert from "assert";
import {ObjectContainer} from "@Lib/shared/container/ObjectContainer";
import {isEmpty} from "@Lib/objUtil";
import assert from "assert";
import * as _ from 'lodash'
import {SYMBOLS} from "@Lib/shared/SYMBOLS";

let c

beforeEach(() => {
  c = new ObjectContainer()
})

/**
 * This test suite uses ObjectContainer, which contains all of ObjectProxyHandler, ArrayProxyHandler and
 * LowProxyHandler, however, the suite specialises on object operations that only make use of ObjectProxyHandler
 */

describe('Basic tests:', () => {
  it('Proxy & propagate is consistent for set operations', () => {
    c.proxy.a = 40
    assert(c.proxy.a === 40, 'Proxy setter failed!')
    assert(c.pristine.a === 40, 'Pristine is not updated!')
    assert(isEmpty(c.merges), 'Merges were applied before they were supposed to!')
    assert(isEmpty(c.deletes), 'Deletes were applied before they were supposed to!')
    assert(isEmpty(c.replaces), 'Replaces were applied before they were supposed to!')
    assert(isEmpty(c.meta), 'Meta were applied before they were supposed to!')

    c.propagateChanges()
    assert(c.proxy.a === 40, 'Proxy does not have proper value for key `a` = 40')
    assert(c.pristine.a === 40, 'Pristine does not have proper value for key `a` = 40')
    assert(c.merges.a === 40, 'Change for key `a` = 40 was not propagated')
    assert(isEmpty(c.deletes), '`Deletes` is not empty!')
    assert(isEmpty(c.replaces), '`Replaces` is not empty!')
    assert(isEmpty(c.meta), '`Meta` is not empty')
  })

  it('Proxy & propagate is consistent for delete operations', () => {
    c.proxy.a = 40
    c.proxy.b = 15
    c.proxy.c = {a: 10, b: 15, c: 22}
    c.propagateChanges()
    c.clear()


    delete c.proxy.a
    c.propagateChanges()
    assert(isEmpty(c.merges), '`Merges` is not empty!')
    assert(c.deletes['*'], 'Array for key deletion (`*`) is missing!')
    assert(c.deletes['*'].indexOf('a') !== -1, 'Key to be deleted (`a`) is not present!')
    c.clear()

    delete c.proxy.b
    delete c.proxy.c.a
    delete c.proxy.c.b
    c.propagateChanges()
    assert(isEmpty(c.merges), 'Changes were not properly addressed for `merges`!')
    assert(c.deletes['*'].indexOf('b') !== -1, 'Changes were not properly addressed for `merges`!')
    assert(c.deletes.c['*'].indexOf('a') !== -1, 'Changes were not properly addressed for `merges`!')
    assert(c.deletes.c['*'].indexOf('b') !== -1, 'Changes were not properly addressed for `merges`!')
    assert(c.pristine.c.c, 'Nested property did not survive removal of its `neighbors`')
  })

  it('Deletes mid-chain are compressed', () => {
    c.proxy.a = {b: {c: {d: {e: {}}}}}
    c.propagateChanges()
    c.clear()

    delete c.proxy.a.b.c.d.e
    delete c.proxy.a.b.c.d
    delete c.proxy.a.b.c
    c.propagateChanges()
    assert(isEmpty(c.merges), 'Changes were not properly addressed for `merges`!')
    assert(c.deletes.a.b['*'].indexOf('c') !== -1, 'Missing the proper key to be deleted (`d`)!')
    assert(Object.keys(c.deletes.a.b).length === 1, 'The chain was not properly cut!')
  })

  it('Stress test for multiple consecutive operations', () => {
    c.proxy.a = 15
    c.proxy.b = {a: 44}
    c.proxy.c = {a: {b: {c: 15}}, d: {k: false}, testString: 'String'}
    c.proxy.xd = {one: 1, two: 2, nest: {one: 1, two: 2}}
    c.propagateChanges()
    assert(c.merges.a)
    assert(c.merges.b)
    assert(c.merges.b.a)
    c.clear()

    c.proxy.b.x = 15
    c.proxy.d = 7
    c.propagateChanges()
    assert(Object.keys(c.merges).length === 2)
    assert(c.merges.b.x = 15)
    assert(c.merges.d = 7)
    c.clear()

    delete c.proxy.c.d.k
    delete c.proxy.b
    delete c.proxy.a
    c.proxy.aaa = 60
    c.proxy.lol = {a: 40, b: 'String'}
    c.propagateChanges()
    assert(_.isEqual(c.merges, {aaa: 60, lol: {a: 40, b: 'String'}}))
    assert(_.isEqual(c.deletes, {'*': ['b', 'a'], c: {d: {'*': ['k']}}}))
    c.clear()

    c.proxy.lol = c.proxy.xd
    c.propagateChanges()
    // We have to assert the serialized version, because lodash's deep equal seems to compare symbols as well
    // The state data (c.pristine || c.proxy) have special attributes attached to them in a form of symbols
    assert(_.isEqual(JSON.stringify(c.merges), JSON.stringify({lol: c.pristine.xd})))
    c.clear()

    c.proxy.xd.p = 5
    c.propagateChanges()
    assert(_.isEqual(c.merges, {lol: {p: 5}, xd: {p: 5}}))
    c.clear()

    delete c.proxy.xd
    c.propagateChanges()
    assert(_.isEqual(c.deletes, {'*': ['xd']}))
    c.clear()

    c.proxy.lol.p = 6
    c.propagateChanges()
    assert(_.isEqual(c.merges, {lol: {p: 6}}))
  })

  it('Shallow copied object`s `merges` propagates and loses its dependencies', () => {
    c.proxy.a = {one: 1, two: 2}
    c.proxy.b = c.proxy.a
    c.propagateChanges()
    c.clear()

    c.proxy.a.three = 3
    c.propagateChanges()
    assert(_.isEqual(c.merges, {a: {three: 3}, b: {three: 3}}))
    c.clear()

    delete c.proxy.b
    c.proxy.a.four = 4
    c.propagateChanges()
    assert(_.isEqual(c.merges, {a: {four: 4}}))
  })

  it('Shallow copied object`s `deletes` propagates and loses its dependencies', () => {
    c.proxy.a = {one: 1, two: 2}
    c.proxy.b = c.proxy.a
    c.propagateChanges()
    c.clear()

    delete c.proxy.a.one
    c.propagateChanges()
    assert(_.isEqual(c.deletes, {a: {'*': ['one']}, b: {'*': ['one']}}))
    c.clear()

    delete c.proxy.a
    c.propagateChanges()
    assert(_.isEqual(c.deletes, {'*': ['a']}))
    c.clear()

    delete c.proxy.b.two
    c.propagateChanges()
    assert(_.isEqual(c.deletes, {b: {'*': ['two']}}))
  })
})
