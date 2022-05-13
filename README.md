# Diploma thesis - Differential data updates
## Overview
This repository contains the whole codebase of the NewSync framework, demo application, performance tests and units tests.

The basic folder strucutre is as folows:
```
/bin      - transpiled files meant to be used in Node.js
            the scratchPad.js is a quick way to test any Node.js code that is us using ESM imports (needs transpilation)
/dist     - transpiled FE files meant to be run in the browser and served via BE 
/lib      - source code for the NewSync framework
/perftest - variety of source files containing performance tests to be run in Node.js or in browser (served by BE)
/src      - source files for the demo application, contains both FE and BE part
/test     - transpiled test possible to be ran via mocha runner
/test_src - mocha runner cannot run ESM imports by default, so Webpack transpiles the tests here to be usable in Mocha
```

## NewSync
NewSync is a framework that helps with automatic synchronization of simulation state represented in-memory with JS
objects that will also try to minimize the amount of data transferred by automatically creating and applying 
differential updates.

It is designed to be easily integrable into existing applications with relative ease. All the 
source files are inside the `/lib` folder. To see examples on how to use it, have a look at the demo application. Its
code is in the `src` folder.

## Instructions
Each of the main folders (`/lib`, `/src` and `/perftest`) have their own readme.md file that contains specific 
instructions for that part. It also features documentation, such as how to integrate the NewSync framework into your
application.

### However, have a look at the general quickstart section to see common problems and prerequisites!

## General quickstart
### Running the demo application
#### Make sure to install `node-pre-gyp` before using ```npm install``` in the project directory!  

**First, install the node-pre-gyp package**, then install the project dependencies. The 
```npm install node-pre-gyp -g``` is required for a ```wrtc``` package to properly install .node addons.
```
npm install node-pre-gyp -g // mandatory!
npm install
```
Then build the application with:
```
npm run build
```
Then run the BE part of the application with:
```
npm run start
```
Start the FE part of the application (made in Vue-cli) with:
```
npm run serve
```
This will launch two servers. The main BE service, and then a Vue development server whose only purpose is to serve
the FE app.

**Make sure the launch the BE first and after that the FE part!** Vue-cli dev server will automatically detect that the
port 8080 is in use and will switch to 8081 instead. The BE part does not contain this automatic detection.

The BE part of the application will default to port ```8080```.   
The FE part of the application will default to port ```8081```.

For more detailed instructions and information look at the readme.md inside `/src` folder.

### HELP: I accidentally ran `npm install` without installing/having `node-pre-gyp`
If you did, then you probably see an error with `wrtc` package missing its .node addon.

Follow these steps:
 1) Make absolutely sure you have `node-pre-gyp` installed by using:  
 `npm install node-pre-gyp -g`
 2) Uninstall the `wrtc` package  
 `npm uninstall wrtc`
 3) Install the `wrtc` package again from scratch  
 `npm install wrtc`
 
After these steps the `wrtc` package should be working properly. The cause might be because even though the .node addon
is missing, the package is considered as installed by NPM, perhaps? Because without prior explicit uninstalling the .node
addon is most likely not going to be installed properly.

# Format performance test
## Node.js
### Limited version
The limited version of the tests excludes the test of `msgpack` package which is problematic to get working properly.

To run the format performance tests, run
```
npm run formatTestLimited
```
The results will be stored in a file called ```stats.txt```.

### Full version
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
## Browser
To run the test in browser, either open the ```/perfttest/browser.html``` file directly or run the BE and navigate to 
```localhost:8080/test``` to have it served.

The test will start automatically when the page loads. The results are then printed onto the screen. Please note that in
Firefox the test can take up to several minutes due to an issue with ```messagepack``` package, which has an atrocious
performance in Firefox specifically.

# Other performance tests
To see what tests are available and how to run them, have a look at the readme.md inside `/perftest` folder.

# Unit tests
There are also some unit tests inside the `test_src` folder. Because the project uses Mocha for tests, and the Mocha
runner does not support ESM imports (and the whole project code base is in ESM), first, they have to be transpiled
by Webpack.

Use this command to transpile all the test source files and run to Mocha on the result (the transpiled files will be put
in `/test` folder).
```
npm run test
```
