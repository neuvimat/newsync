import * as assert from "assert";
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {RtcDriverServer} from "@Lib/server/drivers/RtcDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";

let newSyncServer, container

beforeEach(()=>{

})

describe('Basic tests:', ()=>{
  it('Changes do show', ()=>{
    assert.equal(2,1+1, 'Lol wtf')
  })
})
