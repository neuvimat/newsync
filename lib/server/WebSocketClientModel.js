export class WebSocketClientModel {
  autosync = false
  watchedContainers = []

  constructor(id, socket) {
    this.id = id
    this.socket = socket
  }

  send(message) {
    this.socket.send(message)
  }
}
