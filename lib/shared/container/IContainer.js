/**
 *
 * @interface
 */
export class IContainer {
  dict
  newSync
  /**
   * Generate NewSync applicable list of changes from locally detected and stored changes. Used at the beginning
   * of synchronization cycle.
   */
  propagateChanges() {}

  /**
   * Initialize the container, called when first assigned by NewSync.
   */
  init() {}

  /**
   * Clear whatever the container needs to clean. Used at the end of synchronization cycle.
   */
  clear() {}

  /**
   * Sets the specified value at the position inside the container's state and then marks the change.
   *
   * Does not use automatic difference detection speeding up the process.
   * @param path {string} dot separated list of keys
   * @param value {*} value to set
   */
  set(path, value) {}

  /**
   * Deletes a value at the specified path inside the container's state and then marks the change.
   *
   * Does not use automatic difference detection speeding up the process.
   * @param path {string} dot separated list of keys
   */
  delete(path) {}
}
