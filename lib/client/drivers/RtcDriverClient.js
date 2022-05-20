import {RtcDriverServer} from "@Lib/server/drivers/RtcDriverServer";

/**
 * Client side version of the {@link RtcDriverServer}.
 *
 * Most if the different functionality is handled by the NewSyncClient class, so there may not even be a need for any
 * changes here.
 */
export class RtcDriverClient extends RtcDriverServer {
  constructor() {
    super();
  }
}
