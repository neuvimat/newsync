import {IClientModel} from "@Lib/server/models/IClientModel";

export class WebSocketClientModel extends IClientModel{

  constructor(id, socket) {
    super(id)
    this.socket = socket
  }

  send(message) {
    this.socket.send(message)
  }
}
