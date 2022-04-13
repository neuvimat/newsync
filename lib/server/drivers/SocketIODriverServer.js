import {IDriverClient} from "@Lib/client/drivers/_IDriver";

const DEFAULT_MESSAGES = {}

/**
 *
 */
export class SocketIODriverServer extends IDriverClient {
  constructor() {
    super();
  }

  send() {
    super.send();
  }

  sendToAll() {
    super.sendToAll();
  }

  createClientObject(id, ...args) {
    super.createClientObject(id, ...args);
  }

  removeClient() {
    super.removeClient();
  }

  extractMessage() {
    super.extractMessage();
  }

  isFrameworkMessage(data) {
    super.isFrameworkMessage(data);
  }

  install(...args) {
    super.install(...args);
  }
}
