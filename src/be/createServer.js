import * as http from 'http'
import {app} from "./app";
import {Server} from 'socket.io'
import {WebSocketServer} from "ws";

/**
 * More boilerplate code to make the http server, ws server and socket.io run.
 * Returns the http server, ws server or socket io, depending on commType.
 */

let server;
let port;

export default function makeServer(_port, commType) {;
  port = _port
  app.set('port',_port);
  let io = null
  let wss = null

  server = http.createServer(app);
  if (commType === 1) {
    wss = new WebSocketServer({server: server})
  }
  else if (commType === 2) {
    io = new Server(server)
  }
  else {
    throw new Error('No acceptable communication type specified! Use either 1 (for websocket) or 2 (for WRTC)')
  }

  server.on('error', onError);
  server.on('listening', onListening);

  return [server, io, wss]
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
