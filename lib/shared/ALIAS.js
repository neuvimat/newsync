/**
 * @module
 */

/**
 * Similar to {@link SYMBOLS}, but for keywords. Programmer can access these keywords and alter them in case
 * they collide with their own properties used within the app.
 */
export const ALIAS = {
  KEY_DEL: '*', // Will get shortened by dictionary anyway

  EVENT_SYNC: '$sync',
  EVENT_SYNC_LOW: '$syncLow',
  EVENT_DICTIONARY_UPDATE: '$dictUpdate',
  EVENT_NEW_CONTAINER: '$container'
}
