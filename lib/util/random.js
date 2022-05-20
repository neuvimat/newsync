/**
 * @module
 */

/**
 * Utility class that is more fine-grained than the regular Math.random()
 */
export class Random {
  /**
   * Return random float between min, max (exclusive)
   * @param min {number}
   * @param max {number} (exclusive)
   * @return {number}
   */
  static float(min, max) {
    return min + Math.random() * (max-min)
  }

  /**
   * Return random integer between min, max (exclusive)
   * @param min {number}
   * @param max {number} (exclusive)
   * @return {number}
   */
  static int(min, max) {
    return min + Math.floor(Math.random() * (max-min))
  }

  /**
   * Return random string with the specified length
   * @param min {number}
   * @param max {number} (exclusive)
   * @return {string}
   */
  static string(min, max) {
    let str = ''
    for (let i = 0; i < Random.int(min, max); i++) {
      str += alphabet[Random.int(0, alphabet.length)]
    }
    return str;
  }
}

/**
 * All the possible characters that may appear in a random string
 * @type {string}
 */
const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ '
