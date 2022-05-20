import {COMMANDS} from "@Lib/shared/COMMANDS";

/**
 * An array containing command ID and its arguments representing a NewSync command. The array is used because
 * it takes fewer bytes to store.
 *
 * Create the command by using {@link ServerCommandFactory} or {@link ClientCommandFactory}
 * @class NewSyncCommand
 */

/**
 * Factory for simple creation of commands sent from the server to the clients.
 * @class
 * @static
 */
export const ServerCommandFactory = {
  /**
   * Returns a command representing notification of creation of a new container
   * @param container {string} id of the container
   * @return {NewSyncCommand}
   */
  NEW_CONTAINER(container) {
    return [COMMANDS.NEW_CONTAINER, container]
  },
  /**
   * Returns a command representing notification of creation of multiple new containers
   * @param containers {...string}
   * @return {NewSyncCommand}
   */
  NEW_CONTAINERS(...containers) {
    return [COMMANDS.NEW_CONTAINERS, ...containers]
  },
}
