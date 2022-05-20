/**
 * @module
 */

/**
 * Returns the value if it between min and max, max if the value is larger than max or min if the value is lower than
 * min.
 * @param value {number} value to clamp
 * @param min {number} minimum accepted value
 * @param max {number} maximum accepted value
 * @return {number}
 */
export function clamp(value, min, max) {
  if (value < min) return min
  else if (value > max) return max
  else return value
}

/**
 * Similar to {@link clamp}, but in absolute values. If the absolute value of 'value' is above absolute value of
 * 'clamp', return 'clamp', otherwise 'value'.
 * @param value {number} value to clamp (automatically converted to absolute value)
 * @param clamp {number} maximum accepted value (NOT converted to absolute value by default)
 * @return {number}
 */
export function clampAbs(value, clamp) {
  if (Math.abs(value) < clamp) {
    return value
  }
  else {
    return clamp * Math.sign(value)
  }
}
