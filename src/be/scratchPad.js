import 'source-map-support/register'
import {SimpleContainer} from "@Lib/client/container/SimpleContainer";
import {NewSyncServer} from "@Lib/server/NewSyncServer";
import {RtcDriverServer} from "@Lib/server/drivers/RtcDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {LongKeyDictionaryServer} from "@Lib/shared/LongKeyDictionaryServer";
import assert from "assert";

// const newSyncServer = new NewSyncServer(new RtcDriverServer(), new MessagePackCoder(), new LongKeyDictionaryServer())
// const container = newSyncServer.addContainer('test', new SimpleContainer())
// container.init()
//
// container.proxy.hospitals = {cz: {name: 'XD', gps: {lat: 10, lon: 15}}}
// container.proxy.hospitals.cz.$low.set('name', 'watafuka')
//
// console.log('changes',container.changes);
// console.log('lowPrioChanges',container.lowPrioChanges);
// console.log('version',container.version);
// console.log('changes short', newSyncServer.dict.shortenObject(container.changes));
// console.log('lowPrioChanges short',newSyncServer.dict.shortenObject(container.lowPrioChanges));
//
// console.log('============ clear');
// container.clear()
//
// console.log('changes',container.changes);
// console.log('lowPrioChanges',container.lowPrioChanges);
// console.log('version',container.version);
// console.log('changes short', newSyncServer.dict.shortenObject(container.changes));
// console.log('lowPrioChanges short',newSyncServer.dict.shortenObject(container.lowPrioChanges));

