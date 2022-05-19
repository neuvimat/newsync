// noinspection DuplicatedCode

import {LongKeyDictionaryServer} from "@Lib/server/LongKeyDictionaryServer";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {RtcDriverServer} from "@Lib/server/drivers/RtcDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {ObjectContainer} from "@Lib/shared/container/ObjectContainer";
import {applyMeta} from "@Lib/objUtil";


console.log('x');
let ns, container, client, dict

dict = new LongKeyDictionaryServer(3)
ns = new NewSyncServer(new RtcDriverServer(), new MessagePackCoder(), dict)
ns.welcome = () => {} // Mock
container = ns.addContainer('myContainer', new ObjectContainer())
client = ns.addClient()
client.whitelistContainer('myContainer')
