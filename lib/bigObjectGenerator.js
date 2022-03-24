function generateObject(topLevelKeys = 100,
                               lowLevelKeys = 900,
                               arrayModulo = 10,
                               arrayNumbers = 15, maxRandomNumberValue = 5_000_000) {
  const obj = {}
  for (let i = 0; i < topLevelKeys; i++) {
    obj[i] = {}
    for (let j = 0; j < lowLevelKeys; j++) {
      if (j % arrayModulo === 0) {
        obj[i][j] = []
        for (let k = 0; k < arrayNumbers; k++) {
            obj[i][j].push(Math.floor(Math.random() * maxRandomNumberValue))
        }
      }
      else {
        obj[i][j] = Math.floor(Math.random() * maxRandomNumberValue);
      }
    }
  }
  return obj;
}

module.exports = generateObject
