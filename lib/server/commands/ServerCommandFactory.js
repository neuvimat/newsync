import {COMMANDS} from "@Lib/shared/COMMANDS";

/**
 *
 * @type {{NEW_CONTAINER(*): [number,*], NEW_CONTAINERS(...[*]): *}}
 */
export const ServerCommandFactory = {
  /**
   *
   * @param container
   */
  NEW_CONTAINER(container) {
    return [COMMANDS.NEW_CONTAINER, container]
  },
  /**
   *
   * @param containers
   */
  NEW_CONTAINERS(...containers) {
    return [COMMANDS.NEW_CONTAINERS, ...containers]
  },
}
