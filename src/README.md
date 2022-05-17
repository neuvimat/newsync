# NewSync Demo application
This part of the repository contains both the FE and the BE part of the demo and instructions on how to run these and
some examples of usage on both the client and server side.

## Using the framework
This section serves as a quick overview and minimal examples to make your application harness the power of NewSync.
### Basic concepts
### Server side examples
### Client side examples

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

## Development hints
### Frontend
The ```npm run serve``` command will not only start the development server, but also listen for any changes made to
the application and automatically propagate them to the running server. Even though any UI changes automatically
show up in the application even without explicit reloading, some underlying data may become stale or corrupted. Explicit
reloading of the page in the browser after making any changes to the FE part is recommended.

### Backend
To have the backend automatically restart whenever any change is made to the source code, run this command:
```
npm run watchBack
```
This will run Webpack in watch mode. It will react to any change of the source files and automatically recompile them.
After that, a ```nodemon``` plugin inside Webpack will automatically relaunch the Node.js server. Keep in mind that the
plugin will always launch the application on port 8080! Make sure it is not in use prior.
