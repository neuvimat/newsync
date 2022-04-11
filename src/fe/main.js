import {pack, Packr, unpack, Unpackr} from "msgpackr";
import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";
import {MessagePackCoder} from "@Lib/shared/coder/MessagePackCoder";
import {NewSyncClient} from "@Lib/client/NewSyncClient";

let h1 = document.createElement('h1');
h1.innerHTML = 'Current state'
let h2 = document.createElement('h1');
h2.innerHTML = 'Changes state'
let div = document.createElement('div');
let changes = document.createElement('changes');
document.body.appendChild(h1)
document.body.appendChild(div)
document.body.appendChild(h2)
document.body.appendChild(changes)

const ws = new WebSocket('ws://localhost:8080');
ws.binaryType = "arraybuffer"
const newSyncClient = new NewSyncClient(new WebSocketDriverServer('$'), new MessagePackCoder())


ws.onopen = (event) =>{
  console.log(event);
}
ws.onmessage = (message)=>{
  if (newSyncClient.handleIfFrameworkMessage(message.data)) {return}
  console.log('Not a framework message, your code here:');
}

newSyncClient.addEventListener('sync', (event)=>{
  div.innerHTML = JSON.stringify(event.state)
  changes.innerHTML = JSON.stringify(event.changes)
})
