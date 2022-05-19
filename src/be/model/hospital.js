/**
 * Hospital model
 */
export class Hospital {
  static make(id, name, address, ambulances, lat, lon) {
    return {id, name, address, ambulances, pos: {lat, lon}}
  }
}
