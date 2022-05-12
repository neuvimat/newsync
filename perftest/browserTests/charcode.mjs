/**
 * This test can be run in both Node.js and the browser.
 * It prints all characters from 40 to 70 000 and checks their size in bytes and how JSON would print them.
 */

let intro = document.createElement('div');
intro.innerText = 'Generating report, it may take up few seconds...'
document.body.append(intro)

setTimeout(main, 0)

function main() {
  let table = document.createElement('table');
  let tr = document.createElement('tr');
  tr.innerHTML = `<th>Code</th><th>Char</th><th>Length</th><th>JSON</th><th>JSON Length</th>`
  table.append(tr)
  document.body.append(table)

  function printCharResult(char, code, length, json) {
    let tr = document.createElement('tr');
    tr.innerHTML = `<td>${code}</td><td>${char}</td><td>${length}B</td><td>${json}</td><td>${json.length}</td>`
    table.append(tr)
  }

  const TE = new TextEncoder()

  for (let i = 40; i < 100_000; i++) {
    let char = String.fromCharCode(i)
    let json = JSON.stringify(char)
    printCharResult(char, i, TE.encode(char).length, json)
  }
}
