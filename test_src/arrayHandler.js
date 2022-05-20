// import * as assert from "assert";
import {ObjectContainer} from "@Lib/shared/container/ObjectContainer";
import {applyMeta, isEmpty} from "@Lib/util/objUtil";
import assert from "assert";
import * as _ from 'lodash'
import {INDICES, SYMBOLS} from "@Lib/shared/SYMBOLS";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {LongKeyDictionaryServer} from "@Lib/server/LongKeyDictionaryServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {RtcDriverServer} from "@Lib/server/drivers/RtcDriverServer";

let ns, container, client, dict

beforeEach(() => {
  dict = new LongKeyDictionaryServer(3)
  ns = new NewSyncServer(new RtcDriverServer(), new MessagePackCoder(), dict)
  ns.welcome = ()=>{} // Mock
  container = ns.addContainer('myContainer', new ObjectContainer())
  client = ns.addClient()
  client.whitelistContainer('myContainer')
})

describe('Basic tests:', () => {
  it('Basic Array proxy functionality', () => {
    const objA = {one: 'one', two: 'two'}
    const objB = {three: 'three', four: 'four'}
    container.proxy.a = [objA, objB, objA]
    container.propagateChanges()
    container.clear()

    container.proxy.a.splice(0,1)
    container.propagateChanges()
    assert(container.pristine.a.length === 2, 'Pristine was not correctly updated!')
    let arr = [objA, objB, objA]
    let changes = container.meta
    assert(!isEmpty(changes), 'There are no meta changes!')
    applyMeta({a: arr}, changes) // Create a fake array that imitates the container's one before splice and apply the chagnes
    assert(_.isEqual(arr, container.pristine.a), 'Applying meta changes did not result to the proper result!')
    container.clear()

    container.proxy.a.push({xd: 15}, objA)
    container.propagateChanges()
    assert(!isEmpty(changes), 'There are no meta changes!')
    arr = [objB, objA]
    changes = container.meta
    applyMeta({a: arr}, changes) // Create a fake array that imitates the container's one before splice and apply the chagnes
    assert(_.isEqual(arr, container.pristine.a), 'Applying meta changes did not result to the proper result!')
  })
})
