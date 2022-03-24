import {performance} from 'perf_hooks'
import _ from "lodash";

const errors = []
let testIterations = 10;

const results = {}

/**
 *
 * @type {{label: {String}, object: {}}[]}
 */
const testCases = []

/**
 * @param testCase {{label: {String}, object: {}}}
 */
export function addTestCase(testCase) {
  testCases.push(testCase)
}

export function setTestIterations(num) {
  testIterations = num
}

export function performTest(label, ser, serO, des, desO, sizeCheckFn) {
  results[label] = {}
  for (let c of testCases) {
    const objectUnderTest = c.object
    results[label][c.label] = {ser: [], des: [], size: null}
    for (let i = 0; i < testIterations; i++) {
      const startS = performance.now()
      const serializedObject = ser(objectUnderTest, serO)
      const endS = performance.now();
      const deserializedObject = des(serializedObject, desO)
      const endD = performance.now();

      console.log(`${label} - ${c.label} ${i}: Serialization ${endS - startS} ms; deserialization ${endD - endS} ms`);

      results[label][c.label]['ser'].push(endS - startS)
      results[label][c.label]['des'].push(endD - endS)

      if (!results[label][c.label]['size']) {
        results[label][c.label]['size'] = sizeCheckFn(serializedObject)
      }
      else if (sizeCheckFn(serializedObject) !== results[label][c.label]['size']) {
        console.log('XXX - different object size for different iteration!!!');
        errors.push(`${label}_${i} - object has different size than before`)
      }

      if (!_.isEqual(deserializedObject, objectUnderTest)) {
        console.log('XXX - objects are not equal!!!');
        errors.push(`${label}_${i} - deserialized object is not equal to original one`)
      }
    }
  }
}

export function getResults() {
  return results
}

export function getErrors() {
  return errors
}
