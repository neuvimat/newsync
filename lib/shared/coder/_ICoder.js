export class ICoder {
  neuSync

  pack(data) {}
  unpack(data) {}
  code(data) {this.pack(data)}
  decode(data) {this.unpack(data)}
}
