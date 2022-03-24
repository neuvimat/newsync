export class Random {
  static float(min, max) {
    return min + Math.random() * (max-min)
  }

  static int(min, max) {
    return min + Math.floor(Math.random() * (max-min))
  }

  static string(min, max) {
    let str = ''
    for (let i = 0; i < Random.int(min, max); i++) {
      str += alphabet[Random.int(0, alphabet.length)]
    }
    return str;
  }
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ '
