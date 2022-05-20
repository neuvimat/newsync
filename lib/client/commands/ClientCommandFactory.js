import {COMMANDS} from "@Lib/shared/COMMANDS";

/**
 * Factory for simple creation of commands sent from the clients to the server.
 *
 * @class
 * @static
 */
export const ClientCommandFactory = {
  /**
   * Creates a command for subscribing to a specified container
   * @param container {string} if of the container
   * @return {NewSyncCommand}
   */
  SUBSCRIBE_CONTAINER(container) {
    return [COMMANDS.SUBSCRIBE_CONTAINER, container]
  },
  /**
   * Creates a coomand for subscribing to multiple containers
   * @param containers {...string} ids of containers to subscribe to
   * @return {NewSyncCommand}
   */
  SUBSCRIBE_CONTAINERS(...containers) {
    return [COMMANDS.SUBSCRIBE_CONTAINERS, ...containers]
  },
  /**
   * Command for override to subscribe to all containers.
   * @return {NewSyncCommand}
   */
  SUBSCRIBE_ALL() {
    return [COMMANDS.SUBSCRIBE_ALL]
  },
  /**
   * Unsubscribe a specific container
   * @param container
   * @return {NewSyncCommand}
   */
  UNSUBSCRIBE_CONTAINER(container) {
    return [COMMANDS.UNSUBSCRIBE_CONTAINER, container]
  },
  /**
   * Unsubscribe from multiple containers
   * @param containers
   * @return {NewSyncCommand}
   */
  UNSUBSCRIBE_CONTAINERS(...containers) {
    return [COMMANDS.UNSUBSCRIBE_CONTAINERS, ...containers]
  },
  /**
   * Disable subscribe all override
   * @return {NewSyncCommand}
   */
  UNSUBSCRIBE_ALL() {
    return [COMMANDS.UNSUBSCRIBE_ALL]
  },
}
