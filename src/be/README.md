# NewSync Demo application - Backend
## Source code
The entry point for this part of the demo is `main.js` file.

Many of the files in this folder contain some sort of comments or documentation.

The `scratchPad.js` file is for simple testing as it is hooked up to Webpack build process.

### Folder structure
```
/model      - files that contain definitions of objects used in the simulation
/routes     - url definitons for Express
/simulation - classes that run the simulation and change it during iterations
/views      - .twig files used by the Express framework to serve static HTML (by nowobsoleted by Vue app)
```

## Running the backend
Please refer to the `/src/readme.md` file.

## Note
It is possible to access an HTML page defined inside the `/views` folder at these URLs:
```
/           - index.twig
/pg         - pg.twig
/vis        - vis.twig
/test/:file - runs a file present at /perftest/browserTests (.mjs suffix required) via script.twig file
                    
/perf       - perftest.twig
/perftest   - perftest.twig
/test       - perftest.twig
```
