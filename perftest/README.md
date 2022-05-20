# Performance tests
Note: when instructed to run a test inside Node.js, use this command: `node <path>`, e.g. `node perftest/micro/proxyFilterSort.mjs`. Keep in mind that the path is relative to the terminal (in the example, terminal was open at the repository's top level).

Note: some files containing the tests contain additional comments.

## Folder structure
- `/bin` - run these inside Node.js environment. You may need to rebuild the application, or at least use `npm run watchPref` to produce the runnable files.
- `/browserTets` - access these by running the BE and then navigating to `/test/:filename`, e.g. `/test/charcode`. Omit the .mjs suffix in the URL. Also, all those test file need to be saved with the `.mjs` suffix.
- `/lib` - custom, small library methods used across the tests.
- `/micro` - small tests that do not require transpiling, meant to be run in Node.js
- `/src` - source JavaScript files that are transpiled by Webpack with results placed in the `/bin` folder.
- `browser.html` - file that can be directly opened in browser that will run format performance tests
- `browserMain.js` - source JavaScript automatically linked in `browser.html`
- `nodeMain.js` - Node.js based version of format performance test
- `nodeMainLimited.mjs` - Node.js based version of format performance test (excludes `msgpack` package)
- `testCrossbreeds.mjs` - Node.js based version testing compatibility between multiple records made by different packages

## Running the tests
 - `/bin` - run these inside Node.js environment. You may need to rebuild the application, or at least use `npm run watchPref` to produce the runnable files
 - `/browserTets` - access these by running the BE and then navigating to `/test/:filename`, e.g. `/test/charcode`. Omit the .mjs suffix in the URL. Also, all those test file need to be saved with the `.mjs` suffix.
 - `/lib` - custom, small library methods used across the tests.
 - `/micro` - small tests that do not require transpiling, meant to be run in Node.js
 - `/src` - source JavaScript files that are transpiled by Webpack with results placed in the `/bin` folder.

# Available tests
## Format performance test
### Node.js
#### Limited version
The limited version of the tests excludes the test of `msgpack` package which is problematic to get working properly.

To run the format performance tests, run
```
npm run formatTestLimited
```
The results will be stored in a file called ```stats.txt```.

#### Full version
There is also a full version of the format tests, runnable with this command:
```
npm run formatTest
```
The main difference is this version of the test also tests a `msgpack` dependency, which is Node.js only and requires
a .node addon to run properly, however setting up this package is problematic and often causes issues. To make the
general `npm install` command runs smoothly when installing all the project dependencies, the `msgpack` package is
absent from `package.json`.

To make the full tests runnable, install the `msgpack` package with this command:
```
npm install msgpack
```
Theoretically the installation process should automatically download prebuilt .node binaries for your system, however
often times this fails. It then falls backs to trying to build the .node addon from the source code. On Windows, for
this to work you need to have Python and Microsoft Visual Studio with the required build tools installed. For other
platforms, refer to their respective guides on building .node addons for your specific use case.

Just as with the limited test, the results will be stored in a file called ```stats.txt```.

#### Running the tests directly
You can also run the tests directly by `node perftest/nodeMain.mjs` or `node perftest/nodeMainLimited.mjs`, without invoking them through npm.
### Browser
To run the test in browser, either open the ```/perfttest/browser.html``` file directly or run the BE and navigate to
```localhost:8080/test``` to have it served.

The test will start automatically when the page loads. The results are then printed onto the screen. Please note that in
Firefox the test can take up to several minutes due to an issue with ```messagepack``` package, which has an atrocious
performance in Firefox specifically.

## Simulation speed tests
These tests aim to test the slowdown/speedup introduced when an app uses NewSync framework.

Build the tests beforehand (`npm run build` or `npm run watchPerf`) and then run them via:
```
node perftest/bin/simulationNewSyncMain.js // Testing speed of NewSync app
node perftest/bin/simulationVanillaMain.js // Testing speed of full updates JSON app
```
The tests can be configured in the `/src` folder by altering the top three lines, such as the amount of data or moving
vehicles inside the tests.

The test then writes the results into `NS_${moving amulances}.txt` file for NewSync and `V_${moving amulances}.txt` for vanilla app.

## Micro tests
These are small tests located in `/micro` folder that are all made to be run in Node.js without transpiling via:
```
node perftest/micro/proxyFilterSort.mjs 
node perftest/micro/proxyIncrement.mjs 
node perftest/micro/proxyPush.mjs 
node perftest/micro/unprintableCharacters.mjs // Not an actual test, just prints the characters 
```
All (except unprintable characters) tests produce a file named `${test name}.txt`.

## Browser tests
Access these by running the BE and then navigating to `/test/:filename`, e.g. `/test/charcode`. Omit the .mjs suffix in the URL. Also, all those test file need to be saved with the `.mjs` suffix.

Currently, there is only one test (`charcode.mjs`) and it is not really a test per se, it just shows what UTF-8 characters can be printed and what is their byte size.

The other browser test (format test) is located at the top level of `perftest` folder, see the Format performance test chapter for that.
