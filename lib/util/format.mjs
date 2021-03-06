/**
 * @module util/format
 */

/**
 * Format bytes as human-readable text.
 *
 * @param bytes {number} Number of bytes.
 * @param si {boolean} True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp {number} Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function byteSize(bytes, si=false, dp=3) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

/**
 * Returns current time in hh:mm:ss formatted as a string.
 * @returns {string}
 */
export function timeNow() {
  const t = new Date()
  return formatTime(t)
}

/**
 * Formats the provided date as a string in format hh:mm:ss
 * @param t {Date}
 * @returns {string}
 */
export function formatTime(t) {
  return `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}:${t.getSeconds().toString().padStart(2,'0')}`
}
