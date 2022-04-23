import {COMMANDS} from "@Lib/shared/COMMANDS";

export const ServerCommandFactory = {
  NEW_CONTAINER(container) {
    return [COMMANDS.NEW_CONTAINER, container]
  },
  NEW_CONTAINERS(...containers) {
    return [COMMANDS.NEW_CONTAINERS, ...containers]
  },
}
