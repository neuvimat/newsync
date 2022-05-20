/**
 * Special class that allows to store information inside a bit vector.
 *
 * Allows storing values to specific bits and to get values from a specific bit.
 *
 * The vector automatically grows, but never shrinks down by itself.
 */
export class BitVector {
  constructor() {
    this.length = 0
    this.groups = []
  }

  /**
   * Set the bit at index to value '1'
   * @param index {number} index to set
   */
  setBit(index) {
    const targetByte = Math.floor(index / 32)
    this.groups[targetByte] = this._setNthBit(this.groups[targetByte], index % 32)
  }

  /**
   * Set the bit at index to value '0'
   * @param index {number} index to clear
   */
  clearBit(index) {
    const targetByte = Math.floor(index / 32)
    this.groups[targetByte] = this._clearNthBit(this.groups[targetByte], index % 32)
  }

  /**
   * Returns the value at the specified bit or undefined if the bit vector is not long enough
   * @param index {number} to get
   * @return {0|1|undefined}
   */
  getBit(index) {
    const targetByte = Math.floor(index / 32)
    if (targetByte > this.groups.length) return undefined
    return this._getNthBit(this.groups[targetByte], index % 32)
  }

  /**
   * @param vector
   * @param index
   * @return {number}
   * @private
   */
  _getNthBit(vector, index) {
    return (vector & (1 << index)) === 0 ? 0 : 1;
  }

  /**
   *
   * @param vector
   * @param bitPosition
   * @return {number}
   * @private
   */
  _setNthBit(vector, bitPosition) {
    return vector | (1 << bitPosition);
  }

  /**
   *
   * @param vector
   * @param bitPosition
   * @return {number}
   * @private
   */
  _clearNthBit(vector, bitPosition) {
    const mask = ~(1 << bitPosition);
    return vector & mask;
  }
}
