import {COMMANDS} from "@Lib/shared/COMMANDS";

export const ClientCommandFactory = {
  SUBSCRIBE_CONTAINER(container) {
    return [COMMANDS.SUBSCRIBE_CONTAINER, container]
  },
  SUBSCRIBE_CONTAINERS(...containers) {
    return [COMMANDS.SUBSCRIBE_CONTAINERS, ...containers]
  },
  SUBSCRIBE_ALL() {
    return [COMMANDS.SUBSCRIBE_ALL]
  },
  UNSUBSCRIBE_CONTAINER(container) {
    return [COMMANDS.UNSUBSCRIBE_CONTAINER, container]
  },
  UNSUBSCRIBE_CONTAINERS(...containers) {
    return [COMMANDS.UNSUBSCRIBE_CONTAINERS, ...containers]
  },
  UNSUBSCRIBE_ALL() {
    return [COMMANDS.UNSUBSCRIBE_ALL]
  },
}
