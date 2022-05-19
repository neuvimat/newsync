# NewSync Demo application - Frontend
## Source code
The entry point for this part of the demo is `vue.js` file, however the main logic is inside the `store/index.js` file
to which much of the UI code within `.vue` files refer.

To see all the relevant code for the use of FE NewSync part, see the `store/index.js`, namely observe `connectWS` and `connectWRTC` methods inside `actions`.

When a user clicks a button or performs some other sort of interaction that should result in changes on the BE, the code will use
the `sendEvent` method inside `actions` to send a message to the BE.

### Folder structure
```
/components - Vue components (low level parts of Vue application, small parts of the UI)
/models     - larger structures/objects that are too big to be inlined within components
/router     - Vue router specification
/store      - Vuex definiton, contains all of the NewSyncClient logic
/views      - Vue views (views are more high level than components, i.e. whole pages)
```

## Running the frontend
Please refer to the `/src/readme.md` file.

## Note
The top level file `main.js` is at the current time obsolete. It is currently used for
for quick testing of code that needs to be transpiled to be run in the browser, as the Webpack input is already specified
for this file. Before the Vue app it used to be the entry point for the FE part.


It is possible to access an HTML page where the JS code is ran at this URL:
```
/    - main.js
```
