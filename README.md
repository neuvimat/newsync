# Semester project - State synchronization via delta updates
## Running the application
**Make sure to install node-pre-gyp before running ```npm install``` in the project directory!**  
First, install the node-pre-gyp package, then install the project dependencies. The ```npm install node-pre-gyp -g``` is required for a ```wrtc``` package to properly install prebuilt C libraries.
```
npm install node-pre-gyp -g
npm install
```
Then build the application with:
```
npm run build
```
Then run the application with:
```
npm run start
```
The application will default to port ```8080```.
## Controlling the application
In the client there is a command prompt that allows to input these commands:
- !move \<id> - make an ambulance with the specified ID moving
- !moveall - makes all ambulances moving
- !moverange \<from> \<to> - stops all ambulances from moving and then makes only those in specified range moving
- !stop - stops all ambulances from moving

The application state can be also directly altered by writing valid JavaScript into the prompt. To acces the state, use the ```sim``` key.  
Example:
```
sim.hospitals[0].name = 'New Name'
```
To perform the command, click the evaluate button next to the prompt.

Alternatively you can enter the JavaScript into the browser's console directly.
# Format performance test
### Node.js
For the performance test in Node.js to properly run, you might need to install Python and Microsoft Visual Studio build tools in order to build the native C binaries on Windows for the ```msgpack``` package.

If all the requirement are met, you can then start the test with
```
npm run perftest
```
The results will be stored in a file called ```stats.txt```.

If for some reason the ```msgpack``` package does not work, comment line ```19``` and ```46``` in ```/perftest/nodeMain.mjs```.
## Browser
To run the test in browser, either open the ```/perfttest/browser.html``` file or run the application and navigate to ```localhost:8080/test```.

The test will start automatically when the page loads. The results are then printed onto the screen. Please note that in Firefox the test can take up to several minutes due to an issue with ```messagepack``` package that has an atrocious performance in Firefox specifically.

# Project folder structure
```
├── bin      // Contains built JavaScript bundles created by webpack
├── dist     // Contains static files served by the server and client JavaScript bundles
├── lib      // JavaScript util classes and functions that are used both in client and on server
├── perftest // All the files associated with format performance tests
├── src      
│   ├── be   // All source code files for the server
│   └── fe   // All source code files for the client 
└── views    // html templates for twig render engine served by the server
```
