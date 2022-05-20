/**
 * Prints all characters with charchode between 40 to 100 000 and records their size and if they are printable in JSON
 * format.
 */

let intro = document.createElement('div');
intro.innerText = 'Generating report, it may take up to a few seconds...'
document.body.append(intro)

setTimeout(main, 10) // Give the browser some time to render the above div before getting stuck in the main()

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
