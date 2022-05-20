/**
 * Police vehicle model
 */
export class Car {
  static make(id, sign, type, lat, lon, station) {
    return {id, sign, type, pos: {lat, lon}, station}
  }

  static moveCar(car) {
    car.pos.lat += (Math.random() - 0.5) / 1000;
    car.pos.lon += (Math.random() - 0.5) / 1000;
  }
}
