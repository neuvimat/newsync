export function clamp(value, min, max) {
  if (value < min) return min
  else if (value > max) return max
  else return value
}

export function clampAbs(value, clamp) {
  if (Math.abs(value) < clamp) {
    return value
  }
  else {
    return clamp * Math.sign(value)
  }
}
