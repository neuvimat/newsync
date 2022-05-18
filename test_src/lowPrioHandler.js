// import * as assert from "assert";
import {ObjectContainer} from "@Lib/shared/containers/ObjectContainer";
import {isEmpty} from "@Lib/objUtil";
import assert from "assert";
import * as _ from 'lodash'
import {SYMBOLS} from "@Lib/shared/SYMBOLS";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {RtcDriverServer} from "@Lib/server/drivers/RtcDriverServer";

let ns, c, cl

beforeEach(() => {
  ns = new NewSyncServer(new RtcDriverServer(), new MessagePackCoder(), new LongKeyDictionaryServer())
  ns.welcome = ()=>{} // Mock
  c = ns.addContainer('myContainer', new ObjectContainer())
  cl = ns.addClient()
  cl.whitelistContainer('myContainer')
})

describe('Basic tests:', () => {
  it('Low prio changes are in container', () => {

  })
})
