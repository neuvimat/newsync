/**
 * @interface
 */
export class IContainer {
  /** @type {NewSyncServer} */
  constructor(dictionary, newSync) {
    this.dict = dictionary
    this.newSync = newSync // here due to my premonition stating that it will become useful to have it
  }
}
