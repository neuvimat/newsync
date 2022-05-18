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

## Basic concepts

### NewSync

### Driver

### MessageCoder

### LongKeyDictionary

### Containers

## Server side examples

Setting up the basic server boilerplate:

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
setInterval(() => {state.myObject.a = Math.random()}, 2500)

// Sync every 500ms
newSyncServer.enableAutoSync(500)
```

In order to allow maximum possible flexibility for the network connections, it's the developer's responsibility to tell
NewSync when a viable connection is established. For example, you may want to use WebSocket for other prior data
transfer and only start data synchronization after the user is properly verified or when the user explicitly asks.

Hooking up WebSocketServer connection for the framework (this code expects that you use the ```ws``` NPM package):

```javascript
const httpServer // HTTP server setup omitted
const wss = new WebSocketServer(httpServer)
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

### Client side examples

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
