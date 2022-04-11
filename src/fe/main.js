import {pack, unpack} from "msgpackr";
import {LongKeyDictionary} from "@Lib/shared/LongKeyDictionary";
import {NeuSyncServer} from "@Lib/server/NeuSyncServer";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";


const ws = new WebSocket('ws://localhost:8080');
ws.binaryType = "arraybuffer"
const neuSync = new NeuSyncServer(new WebSocketDriverServer('$'), new MessagePackCoder())

ws.onopen = (event) =>{
  console.log(event);
}
ws.onmessage = (message)=>{
  const frameworkMessage = neuSync.isFrameworkMessage(message.data)
  if (frameworkMessage) {
    const array = new Uint8Array(message.data.slice(1))
    const obj = unpack(array)
    console.log('Received message:', frameworkMessage, message.data);
    console.log('Reconstructed object:', obj);
    console.log('JSON size of object:', new TextEncoder().encode(JSON.stringify(obj)).buffer.byteLength, JSON.stringify(obj));
  }
}
