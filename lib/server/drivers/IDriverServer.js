/**
 * Specification of server-side network drivers.
 *
 * It is important to note that each driver creates completely custom version of AbstractClientModel! The driver can
 * alter it anyhow it feels fit. But since it created and altered the model, and since it is the only component
 * of the framework that works with it, it should know how to handle any possible edge-cases and alterations made to it.
 * @interface
 */
export class IDriverServer {
  /**
   * Auto-injected when the NewSyncServer is constructed
   * @type {NewSyncServer}
   */
  newSync
  /**
   * Send a message to the specified client
   * @param client {AbstractClientModel}
   * @param message {*}
   */
  send(client, message) {}

  /**
   * Sends a message to all connected clients
   * @param message {*}
   */
  sendToAll(message) {}

  /**
   * Always received the ID from the NewSync, the rest of the parameters are filled by the user when calling
   * NewSync.addClient(...args).
   * @return {AbstractClientModel} the model altered anyhow the driver needs it to
   */
  createClientObject(id, ...args) {}

  /**
   * Any cleanup the driver has to do when removing the client, if any
   * @param {AbstractClientModel} client
   */
  removeClient(client) {}

  /**
   * Returns true if the data is in binary representation. Due to some differences between browser and Node.js, this
   * methods had to be abstracted, so it can be overridden by the respective platform's implementation while we allow sharing the code base
   * between them.
   * @param data {*}
   * @return {boolean}
   */
  isBinary(data) {}

  /**
   * Pack message. Allows the driver to somehow alter the message beforehand. For instance, {@link WebSocketDriverServer}
   * uses this method to inject a prefix to the message, if the prefix is specified.
   * @param message {*}
   * @return {*} packed message
   */
  packMessage(message) {}

  /**
   * Send the data directly to a client (does not need to be packed beforehand)
   * @param client {AbstractClientModel}
   * @param data {*}
   */
  sendData(client, data) {}

  /**
   * Send the data directly to a client (does not need to be packed beforehand) via low prio channel (if applicable)
   * @param client {AbstractClientModel}
   * @param data {*}
   */
  sendDataLowPrio(client, data) {}

  /**
   * Send a message to a client via low prio channel (if applicable)
   * @param client {AbstractClientModel}
   * @param data {*}
   */
  sendLowPrio(client, data) {}

  /**
   * Initialize the driver
   */
  install() {}

  /**
   * Send the message to all connected clients (uses the auto-injected newSync property to get a hold of all clients) via
   * the low prio channel (if applicable)
   * @param message {*}
   */
  sendToAllPrio(message) {}

  /**
   * States whether this driver supports low priority messages
   * @return {boolean}
   */
  isLowPrioSupported() {}

  extractMessage(data) {}

  isFrameworkMessage(data) {}

  sendToAllLowPrio() {}
}
