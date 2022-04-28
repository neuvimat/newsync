export class Car {
  static make(id, sign, type, lat, lon, station) {
    return {id, sign, type, pos: {lat, lon}, station}
  }

  static moveCar(car) {
    car.pos.lat += (3 + Math.random()) / 4000;
    car.pos.lon += (3 + Math.random()) / 4000;
  }
}
