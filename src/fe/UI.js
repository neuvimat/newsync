import {byteSize, timeNow} from "../../lib/format.mjs";

/**
 * This class is an abstraction that handles updating the app's visuals
 */
export class UI {
  constructor() {
    this.eState = document.getElementById('state');
    this.eHistory = document.getElementById('history');
    this.ePrompt = document.getElementById('prompt');
    this.ePromptSubmit = document.getElementById('promptSubmit');
    this.eStatusBarTotal = document.getElementById('statusBarTotal');
    this.eStatusBarFull = document.getElementById('statusBarFull');
    this.eStatusBarDelta = document.getElementById('statusBarDelta');
    this.eStatusBarFullMP = document.getElementById('statusBarFullMP');
    this.eStatusBarDeltaMP = document.getElementById('statusBarDeltaMP');

    this._initPrompt()
  }

  setRtcChannel(channel) {
    this.channel = channel;
  }

  // The main view
  updateState(state) {
    this.eState.innerText = JSON.stringify(state, null, 2)
  }

  // Sidebar on the right
  addHistoryRecord(full, fullSize, delta, deltaSize, fullMPSize, deltaMPSize) {
    for (let record of [[full, fullSize, 'Full - JSON'], [delta, deltaSize, 'Delta - JSON'], ['Binary data', fullMPSize, 'Full - MessagePack'],['Binary data', deltaMPSize, 'Delta - MessagePack']]) {
      let wrapper = makeE('div', 'history');
      let header = makeE('div', 'header');
      let headerL = makeE('headerL', 'headerL');
      let headerR = makeE('headerR', 'historyR');
      let content = makeE('div', 'content');

      header.append(headerL, headerR)

      header.addEventListener('click', () => {
        if (content.style.display === 'block') content.style.display = 'none'
        else content.style.display = 'block'
      })

      const t = timeNow()
      headerL.innerHTML = `${t} - ${record[2]}`
      headerR.innerHTML = `${byteSize(record[1])}`

      content.innerHTML = record[0]

      wrapper.append(header, content)
      this.eHistory.append(wrapper)
    }
    this.eHistory.append(document.createElement('hr'))
  }

  // Yellow status bar at the bottom
  updateStatusBar(total,full,delta,fullPacked,deltaPacked) {
    this.eStatusBarTotal.innerHTML = `Total size: ${byteSize(total,false, 3)}`
    this.eStatusBarFull.innerHTML = `Full JSON: ${byteSize(full,false, 3)} ${(full*100/total).toFixed(2)}% of total`
    this.eStatusBarDelta.innerHTML = `Delta JSON: ${byteSize(delta,false, 3)} ${(delta*100/total).toFixed(2)}% of total; ${(delta*100/full).toFixed(2)}% of JSON`
    this.eStatusBarFullMP.innerHTML = `Full MP: ${byteSize(fullPacked,false, 3)} ${(fullPacked*100/total).toFixed(2)}% of total; ${(fullPacked*100/full).toFixed(2)}% of JSON`
    this.eStatusBarDeltaMP.innerHTML = `Delta MP: ${byteSize(deltaPacked,false, 3)} ${(deltaPacked*100/total).toFixed(2)}% of total; ${(deltaPacked*100/full).toFixed(2)}% of JSON`
  }

  // Prepare the prompt's functionality
  _initPrompt() {
    this.ePromptSubmit.addEventListener('click', ()=>{
      if (this.ePrompt.value[0] === '!') {
        if (this.channel) {
          this.channel.send(this.ePrompt.value)
        }
      }
      else {
        eval(this.ePrompt.value)
      }
    })
  }
}

// Helper method to create an element with css class and inlined style
function makeE(tag, css = '', style = {}) {
  const e = document.createElement(tag)
  e.className = css;
  for (let key in style) {
    e.style[key] = style
  }

  return e
}
