export class Ambulance {
  static make(id, sign, lat, lon) {
    return {id, sign, pos: {lat, lon}}
  }

  static moveAmbulance(ambulance) {
    ambulance.pos.lat += (3 + Math.random()) / 40000;
    ambulance.pos.lon += (3 + Math.random()) / 40000;
  }
}
