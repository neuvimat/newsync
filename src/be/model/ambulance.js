/**
 * Ambulance model
 */
export class Ambulance {
  static make(id, sign, lat, lon, hospital) {
    return {id, sign, pos: {lat, lon}, hospital}
  }

  static moveAmbulance(ambulance) {
    ambulance.pos.lat += (Math.random() - 0.5) / 1000;
    ambulance.pos.lon += (Math.random() - 0.5) / 1000;
  }
}
