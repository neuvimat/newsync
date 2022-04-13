export class SocketIOSignallerClient {
  constructor() {
  }

  install(ioSocket, messageName = 'NewSync') {
    ioSocket.on('connect', ()=>{

    })
    ioSocket.on(messageName, (message)=>{

    })
  }
}
