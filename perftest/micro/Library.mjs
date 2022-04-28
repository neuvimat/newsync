let _results = []
let _tests = []
let _before = null
let _beforeEach = null

export function runTests() {
  // Warm up
  for (let i = 0; i < 10; i++) {
    for (const test of _tests) {
      test[1]()
    }
  }

  for (const test of _tests) {
    const start = performance.now()
    test[1]()
    const duration = performance.now() - start
    _results.push([test[0], test[1]])
    console.log(`${test[0]}: ${duration} ms`);
  }
}

export function runTestsSkipWarmup() {
  for (const test of _tests) {
    const start = performance.now()
    test[1]()
    const duration = performance.now() - start
    _results.push([test[0], test[1]])
    console.log(`${test[0]}: ${duration} ms`);
  }
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
