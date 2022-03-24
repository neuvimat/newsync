import * as http from 'http'
import {app} from "./app";
import {Server} from 'socket.io'

// More boilerplate code to make the http server and socket.io run

let server;

export default function makeServer(_port) {
  let port = normalizePort(process.env.PORT || _port || '3000');
  app.set('port', port);

  server = http.createServer(app);
  const io = new Server(server)

  server.on('error', onError);
  server.on('listening', onListening);

  return [server, io]
}

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
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
