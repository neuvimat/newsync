export class WebSocketClientModel {

  constructor(id, socket) {
    this.id = id
    this.socket = socket
  }

  send(message) {
    this.socket.send(message)
  }
}
