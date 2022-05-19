# NewSync Demo application

This part of the repository contains both the FE and the BE part of the demo and instructions on how to run these and
some examples of usage on both the client and server side.

## Folder structure

```
/assets  - assets used by the Vue frontend (icons, sfx, ... that gets processed)
/be      - source files for BE
/fe      - Vue source files for FE
```

# Using the framework

This section serves as a quick overview and minimal examples to make your application harness the power of NewSync.

To see all the events that can be listened to or the possible variants of drivers, etc. have a look at the reamde.md in `/lib` folder.

## Server side examples

### Setting up the basic server boilerplate

```javascript
// Initial setup
const driver = new WebSocketServerDriver()
const coder = new MessagePackCoder()
const dictionary = new LongKeyDictionaryServer()
const newSyncServer = new newSyncServer(driver, coder, dictionary)

// State (container) setup
const container = newSyncServer.addContainer('myContainer', new ObjectContainer())
const state = container.proxy // shortcut to the automatic change detecting reference
state.myObject = {a: 10, b: 20}

// Create regular changes
// All changes made to the container via the 'proxy' field will trigger automatic detection
setInterval(() => {state.myObject.a = Math.random()}, 2500)

// Sync every 500ms
newSyncServer.enableAutoSync(500)
```

### Hooking up to existing connection

In order to allow maximum possible flexibility for the network connections, it's the developer's responsibility to tell
NewSync when a viable connection is established. For example, you may want to use WebSocket for other prior data
transfer and only start data synchronization after the user is properly verified or when the user explicitly asks.

This code expects that you use the ```ws``` NPM package.

```javascript
const httpServer // HTTP server setup omitted
const wss = new WebSocketServer(httpServer)
const newSyncServer = new newSyncServer(driver, coder, dictionary)

wss.on('connection', (socket) => {
  // Use the returned client handle for any NewSync operations that require specification of a client.
  const client = newSyncServer.addClient(socket)

  socket.on('message', (message, isBinary) => {
    // NewSync messages are always binary and the 'ws' package exposes whether the received message is binary.
    // We can use that to not wastefully check text messages.
    if (isBinary && newSync.handleIfFrameworkMessage(message, client)) { return }
    console.log('Received a non-NewSync message, run your own code here:', message.toString());
  })

  socket.on('error', (socket) => {
    newSyncServer.removeClient(client)
  })
  socket.on('closer', (socket) => {
    newSyncServer.removeClient(client)
  })
})
```

### Low priority messages
If you use a connection that supports low priority messages (WRCT for instance), you create low priority changes like this:
```javascript
import {SYMBOLS} from '@Lib/shared/SYMBOLS' // location for the demo app file structure
const container = NewSync.addContainer('myContainer', new ObjectContainer())

// Access the special low priority handler via symbol 'sLow' that is exported in SYMBOLS object
container.proxy[SYMBOLS.sLow].set('key', 'value').set('another key', 10) // Allows to chain the set(key, value) method
```
If you make low priority changes for a connection that does not support them, they will be automatically merged to regular
synchronization message.

Low priority changes can only be in the nature of the set() method (i.e. no deletes or state tracking is enabled).

### Custom messages
You can also send custom events or messages from server to client and vice versa.

Sending custom messages/events:
```javascript
// NewSync setup omitted for brevity
let newSync;
const someClient; // a client connected to NewSync framework

// Events are specified by event name and any number of arguments of any type
// Send the event immediately
newSync.sendEventAll('eventName', arg1, arg2, ...) // Broadcast event
newSync.sendEvent(someClient, 'eventName', arg1, arg2, ...) // Send an event to specific client

// Store the event in a queue that will be transmitted together with the synchronization message 
newSync.scheduleEventAll('eventName', arg1, arg2, ...) // Broadcast event
newSync.schedulesendEvent(someClient, 'eventName', arg1, arg2, ...) // Send an event to specific client

// Message is a singular object of any structure
newSync.sendMessageAll({field: 40})
newSync.sendMessage(someClient, {value: 15})

// Store the message in a queue that will be transmitted together with the synchronization message 
newSync.scheduleMessageAll('eventName', arg1, arg2, ...) // Broadcast event
newSync.schedulesendMessage(someClient, 'eventName', arg1, arg2, ...) // Send an event to specific client
```

Reacting to custom messages/events:
```javascript
// NewSync setup omitted for brevity
let newSync;
const someClient; // a client connected to NewSync framework

// Listen to event by its name. First argument is always the client from whom the event originated.
newSync.on('eventName', (client, arg1, arg2, ...) => { ...any code here }) 

// Register a handler for message. First argument is alrays the client from whom the message originated.
newSync.onmessage = (client, message) => { ...any code here}  
newSync.setCustomMessageHandler((client, message) => { ...any code here}) // Alternative way to set the custom handler  
```

### Manual changes detection
To skip the automatic detection and speedup the application quite significantly you can bypass it and edit the container
state directly via the ```pristine``` field on the container. Note that any changes made like this need to be marked
manually.

There are three main fields for marking changes: `merges`, `deletes` and `meta`. 'Merges' is a simple object of keys and values,
however `deletes` and `meta` are not, and you should not alter them manually without using utility methods on the container.

```javascript
const container = NewSync.addContainer('myContainer', new ObjectContainer())
container.pristine.myField = 40 // Make the change itself
container.merges.myField = 40 // Mark it manually

// Alternatively, you can use the utility methods provided on the container instance
container.set('myField', 40)
container.set('myNestedObject.someField', 15)
container.delete('path.to.key')
```

## Client side examples
### Basic setup
```javascript
import {COMMANDS} from "@Lib/shared/COMMANDS";
import {ClientCommandFactory} from "@Lib/client/commands/ClientCommandFactory";

const ns = new NewSyncClient(new WebSocketDriverClient(''), new MessagePackCoder(), new LongKeyDictionaryClient())
ns.addContainer('health', new SimpleContainer())
ns.addContainer('police', new SimpleContainer())
ns.on(ALIAS.EVENT_SYNC, (event) => {
  // React to receiving a new NewSync message
  // Access the decoded message via event.message
  console.log('event.message', event.message);
})

ws = new WebSocket('ws://localhost:8080')
ws.onopen = () => {
    ns.setConnection(ws)
    ns.sendCommand(ClientCommandFactory.SUBSCRIBE_ALL()) // Subscribe to all containers after connecting
    ns.sendCommand(ClientCommandFactory.SUBSCRIBE_CONTAINER('someContainer')) // Subscribe to a specific container
  }
    
  ws.onmessage = (msg) => {
  if (ns.handleIfFrameworkMessage(msg.data)) {
    // Alternatively you can react to receiving a new message here, but note
    // that the msg.data is in binary format
  }
  else {
    // Not a NewSync message, your own code here
  }
}
```

### Custom messages
You can also send custom events or messages from client to server and vice versa.

Sending custom messages/events:
```javascript
// NewSync setup omitted for brevity
let newSyncClient;

// Events are specified by event name and any number of arguments of any type
// Send the event immediately
newSync.sendEvent('eventName', arg1, arg2, ...) // Broadcast event

// Store the event in a queue that will be transmitted together with the synchronization message 
newSync.scheduleEvent('eventName', arg1, arg2, ...) // Broadcast event

// Message is a singular object of any structure
newSync.sendMessage({field: 40})

// Store the message in a queue that will be transmitted together with the synchronization message 
newSync.scheduleMessage('eventName', arg1, arg2, ...) // Broadcast event
```

Reacting to custom messages/events:
```javascript
// NewSync setup omitted for brevity
let newSync;
const someClient; // a client connected to NewSync framework

// Listen to event by its name. Since this is a client version, no client is passed to the listener.
newSync.on('eventName', (arg1, arg2, ...) => { ...any code here }) 

// Register a handler for message. Since this is a client version, no client is passed to the listener.
newSync.onmessage = (message) => { ...any code here}  
newSync.setCustomMessageHandler((message) => { ...any code here}) // Alternative way to set the custom handler  
```

## Documentation

Both the FE and BE part contains commentaries at the relevant parts of the code.

However, the FE part does not feature developer commentary for the Vue UI part as the FE features standard concepts used
within the framework. However, there are comments at the `store/index.js` file which hosts most of the required logic to
make a NewSync FE app.

## Running the app

First produce the server (backend) side application code with this command:

```
npm run buildBe
```

Then you can run the backend part of the application with this command:

```
npm run be
```

The above command will launch the application at port 8080 in WebRTC mode by default.

Then serve the FE part written in Vue by running this command:

```
npm run serve
```

The serve command will start a dedicated server whose only purpose is to serve the built Vue frontend. it automatically
scans the 8080 port and runs on it, unless in is already in use, after which it scans for port 8081 and so forth.

### Config

Change the default port by passing an optional, first position numeric argument. The inputted value will be used as the
desired port.

You can alter the connection mode between WebSocket and WebRTC by passing second position numeric argument. Use ```1```
for WebSocket and ```2``` for WebRTC. Because the arguments are positioned based, if you want to change the connection
type, you have to fill in the port, too.

Examples:

```
Running on specific port
npm run be -- 3000 // will start the application at port 3000
npm run be -- 3000 1 // will start the application at port 3000 in WebSocket mode
npm run be -- 3000 2 // will start the application at port 3000 in WebRTC mode

You can also run the built file directly with node:
node bin/be.js 3000 1 // will start the application at port 3000 in WebSocket mode
node bin/be.js 3000 2 // will start the application at port 3000 in WebRTC mode
```

## Vue frontend vs Express

The BE server has the ability to serve static HTML. In the ideal world, it would serve the Vue app (currently, we use
the Vue development server for that). However, it still serves some HTML that is located at ```be/views```. In that
folder, there are some ```.twig``` files. The BE also has the ability to serve various tests. See the readme.md in the
```perftest``` folder for more details.

## Development hints

### Frontend

The ```npm run serve``` command will not only start the development server, but also listen for any changes made to the
application and automatically propagate them to the running server. Even though any UI changes automatically show up in
the application even without explicit reloading, some underlying data may become stale or corrupted. Explicit reloading
of the page in the browser after making any changes to the FE part is recommended.

### Backend

To have the backend automatically restart whenever any change is made to the source code, run this command:

```
npm run watchBack
```

This will run Webpack in watch mode. It will react to any change of the source files and automatically recompile them.
After that, a ```nodemon``` plugin inside Webpack will automatically relaunch the Node.js server. Keep in mind that the
plugin will always launch the application on port 8080! Make sure it is not in use prior.
