import {AbstractClientModel} from "@Lib/server/models/AbstractClientModel";

export class WebSocketClientModel extends AbstractClientModel {

  constructor(id, socket) {
    super(id)
    this.socket = socket
  }
}
