export class Station {
  static make(id, name, address, cars, lat, lon) {
    return {id, name, address, cars, pos: {lat, lon}}
  }
}
