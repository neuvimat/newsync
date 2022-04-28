export class BitVector {
  constructor() {
    this.length = 0
    this.groups = []
  }

  setBit(index) {
    const targetByte = Math.floor(index / 32)
    this.groups[targetByte] = this._setNthBit(this.groups[targetByte], index % 32)
  }

  clearBit(index) {
    const targetByte = Math.floor(index / 32)
    this.groups[targetByte] = this._clearNthBit(this.groups[targetByte], index % 32)
  }

  getBit(index) {
    const targetByte = Math.floor(index / 32)
    if (targetByte > this.groups.length) return undefined
    return this._getNthBit(this.groups[targetByte], index % 32)
  }

  _getNthBit(vector, index) {
    return (vector & (1 << index)) === 0 ? 0 : 1;
  }

  _setNthBit(vector, bitPosition) {
    return vector | (1 << bitPosition);
  }

  _clearNthBit(vector, bitPosition) {
    const mask = ~(1 << bitPosition);
    return vector & mask;
  }
}
