/**
 * Ambulance model
 */
export class Ambulance {
  static make(id, sign, lat, lon, hospital) {
    return {id, sign, pos: {lat, lon}, hospital}
  }

  static moveAmbulance(ambulance) {
    ambulance.pos.lat += (3 + Math.random()) / 4000;
    ambulance.pos.lon += (3 + Math.random()) / 4000;
  }
}
