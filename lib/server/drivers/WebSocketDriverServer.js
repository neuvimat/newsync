import {IDriver} from "@Lib/client/drivers/_IDriver";
import {SYMBOL} from "@Lib/shared/SYMBOL";
import {WebSocketClientModel} from "@Lib/server/WebSocketClientModel";

export class WebSocketDriverServer extends IDriver {
  _prefix

  constructor(prefix = '&') {
    super();
    this.prefix = prefix
  }

  set prefix(val) {
    this._prefix = val
    this._prefixBytes = new TextEncoder().encode(val)
  }

  get prefix() {
    return this._prefix
  }

  send(object, client) {
    const msgPackMessage = this.newSync.coder.packr.pack(object)
    const wholeMessage = new Uint8Array(this._prefixBytes.length + msgPackMessage.length)
    wholeMessage.set(this._prefixBytes, 0)
    wholeMessage.set(msgPackMessage, this._prefixBytes.length)
    client.socket.send(wholeMessage)
  }

  sendToAll(object) {
    const msgPackMessage = this.newSync.coder.packr.pack(object)
    const wholeMessage = new Uint8Array(this._prefixBytes.length + msgPackMessage.length)
    wholeMessage.set(this._prefixBytes, 0)
    wholeMessage.set(msgPackMessage, this._prefixBytes.length)
    const clients = this.newSync.clients
    for (let c in clients) {
      clients[c].socket.send(wholeMessage)
    }
  }

  createClientObject(id, socket) {
    return new WebSocketClientModel(id, socket)
  }

  removeClient(socket) {
    // Can do some cleanup here
  }

  extractMessage(data) {
    // console.log('data',data);
    if (typeof data === 'string') {
      const prefixMatch = data.substring(0, this.prefix.length) === this.prefix
      if (prefixMatch) {
        return this.newSync.coder.unpack(data.substring(this.prefix.length))
      }
      else {return false}
    }
    else if (data instanceof ArrayBuffer) {
      data = new Uint8Array(data)
      for (let i = 0; i < this._prefixBytes.length; i++) {
        if (data[i] !== this._prefixBytes[i]) return false
      }
      return this.newSync.coder.unpack(Uint8Array.from(data.slice(this._prefixBytes.length)))
    }
    return false
  }

  isFrameworkMessage(data) {
    if (typeof data === 'string') {
      return data.substring(0, this.prefix.length) === this.prefix
    }
    else if (data instanceof ArrayBuffer) {
      data = new Uint8Array(data)
      for (let i = 0; i < this._prefixBytes.length; i++) {
        if (data[i] !== this._prefixBytes[i]) return false
      }
      return true
    }
    return false
  }

  _getSymbols(ws) {
    ws.addEventListener('message', () => {})
    const symbolRetrieval = ws.listeners('message')[0]
    let listenerSymbol
    let attributeSymbol
    for (let s of Object.getOwnPropertySymbols(symbolRetrieval)) {
      if (s.toString() === 'Symbol(kListener)') {listenerSymbol = s}
      else if (s.toString() === 'Symbol(kIsForOnEventAttribute)') {attributeSymbol = s}
    }

    return {listenerSymbol, attributeSymbol}
  }

  install(ws) {
    ws.onmessage = null
    const oldListeners = ws.listeners('message')
    ws.removeAllListeners('message')

    let {listenerSymbol, attributeSymbol} = this._getSymbols(ws)

    let handled

    ws.on('message', (data) => {
      handled = this.handleMessage(data)
    })

    for (let l of oldListeners) {
      if (l[attributeSymbol] === true) {
        ws.onmessage = (data) => {
          if (!handled) {
            l[listenerSymbol](data)
          }
        }
      }
      if (l[attributeSymbol] === false) {
        ws.addEventListener('message', (data) => {
          if (!handled) {
            l[listenerSymbol](data)
          }
        })
      }
      if (l[listenerSymbol] === undefined) {
        ws.on('message', (data) => {
          if (!handled) {
            l(data)
          }
        })
      }
    }
  }
}
