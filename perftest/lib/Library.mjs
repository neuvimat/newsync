/**
 * Library that allows to define tests, pre-warm the VM, record how long the tests took and write the results in a file.
 */

import {promises as fs} from 'fs'

let _results = []
let _tests = []
let _before = null
let _beforeEach = null

function iterateTests(testIters = 1) {
  if (_before) {_before()}
  for (const test of _tests) {
    for (let i = 0; i < testIters; i++) {
      if (_beforeEach) {_beforeEach()}
      const start = performance.now()
      test[1]()
      const duration = performance.now() - start
      _results.push([test[0], duration])
      // console.log(`${test[0]} (${i}): ${duration} ms`);
    }
  }
}

export function runTests(warmupIters = 10, testIters = 10) {
  // Warm up
  if (warmupIters > 0) {
    if (_before) {_before()}
    for (const test of _tests) {
      for (let i = 0; i < warmupIters; i++) {
        if (_beforeEach) {_beforeEach()}
        test[1]()
      }
    }
  }

  iterateTests(testIters)
}

export function runTestsSkipWarmup(testIters) {
  iterateTests(testIters)
}

export function test(label, fn) {
  _tests.push([label, fn])
}

export function before(fn) {
  _before = fn
}

export function beforeEach(fn) {
  _beforeEach = fn
}

export async function writeStats(filename) {
  // Group the results array by their labels
  const resultMap = new Map()
  for (const [label, duration] of _results) {
    let mapEntry = resultMap.get(label)
    if (!mapEntry) {
      mapEntry = {label: label, values: []}
      resultMap.set(label, mapEntry)
    }
    mapEntry.values.push(duration)
  }

  // Create the text output
  let output = ''
  for (const [k, v] of resultMap) {
    output += v.label + ':\n'
    output += v.values.join(',') + '\n\n'
  }

  // Write the file
  await fs.writeFile(filename, output)
}
