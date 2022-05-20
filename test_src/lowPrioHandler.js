// import * as assert from "assert";
import {ObjectContainer} from "@Lib/shared/container/ObjectContainer";
import {isEmpty} from "@Lib/util/objUtil";
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
  it('Low prio changes return new message if supported', () => {
    container.pristine.a = 15

    assert(container.pristine.a === 15)
    assert(isEmpty(container.merges), '`merges` is not empty!')
    assert(isEmpty(container.lowPrio), '`lowPrio` is not empty!')

    container.proxy[SYMBOLS.sLow].set('b', 20).set('a',19)
    container.propagateChanges()
    assert(isEmpty(container.merges), '`merges` is not empty!')
    assert(container.pristine.a === 19, '`pristine.a` is not 19!')
    assert(container.pristine.b === 20, '`pristine.b` is not 20!')
    assert(container.lowPrio.a === 19, '`lowPrio.a` is not 19!')
    assert(container.lowPrio.b === 20, '`lowPrio.b` is not 20!')

    const lpMsg = ns.getLowPrioChangesMessage(client) // returns packed container under shortened key
    const changes = lpMsg[INDICES.merges]
    const actualChanges = ns.coder.unpack(changes[dict.shorten('myContainer')])
    assert(_.isEqual(actualChanges, [{b:20,a:19}]))

    container.clear()
  })
})
