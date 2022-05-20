/**
 *
 * @interface
 */
export class ICoder {
  newSync

  /**
   * Pack any data to this coder's format
   * @param data {*}
   */
  pack(data) {}

  /**
   * Unpack any data into this coder's format
   * @param data {*}
   */
  unpack(data) {}

  /**
   * Alias for {@link pack}
   * @param data {*}
   */
  code(data) {this.pack(data)}

  /**
   * Alias for {@link unpack}
   * @param data {*}
   */
  decode(data) {this.unpack(data)}
}
