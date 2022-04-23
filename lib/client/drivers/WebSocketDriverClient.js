import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";

export class WebSocketDriverClient extends WebSocketDriverServer {
  constructor(prefix) {
    super(prefix);
  }

  isBinary(data) {
    return data instanceof ArrayBuffer; // In the browsers, we get ArrayBuffer, in node.js, we get just Buffer
  }
}
