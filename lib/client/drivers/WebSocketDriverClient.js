import {WebSocketDriverServer} from "@Lib/server/drivers/WebSocketDriverServer";

/**
 * Client side version of the {@link WebSocketDriverServer}.
 *
 * Most if the different functionality is handled by the NewSyncClient class, so there may not even be a need for any
 * changes here.
 */
export class WebSocketDriverClient extends WebSocketDriverServer {
  constructor(prefix = '&') {
    super(prefix);
  }

  isBinary(data) {
    return data instanceof ArrayBuffer; // In the browsers, we get ArrayBuffer, in node.js, we get just Buffer
  }
}
