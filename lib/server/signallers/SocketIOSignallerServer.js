export class SocketIOSignallerServer {
  constructor() {

  }

  install(ioSocket, messageName = 'NewSync') {
    ioSocket.on(messageName, (message)=>{

    })
  }

  installFull(ioServer, messageName = 'NewSync') {
    ioServer.on('connection', (socket) => {
      socket.emit(messageName, {xd: 'ja'})
      this.install(socket, messageName)
    })
  }
}
