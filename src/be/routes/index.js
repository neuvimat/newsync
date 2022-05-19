let express = require('express');
let router = express.Router();
const path = require('path')

/**
 * Basic routing for the Express framework
 */

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Format Size test & speed' });
});

/**
 * Experimental Vue path to deploy the application directly without a need for dedicated serving server (for which the
 * development Vue-cli server is used).
 */
router.get('/vue', function(req, res, next) {
  res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'))
});

// router.get('/vis', function(req, res, next) {
//   res.render('vis', { title: 'Framework visualization' });
// });
//
// router.get('/pg', function(req, res, next) {
//   res.render('pg', { title: 'Playground and testing' });
// });

router.get('/perf', function(req, res, next) {
  res.render('perftest', { title: 'Format Size test & speed' });
});
router.get('/perftest', function(req, res, next) {
  res.render('perftest', { title: 'Format Size test & speed' });
});
router.get('/test', function(req, res, next) {
  res.render('perftest', { title: 'Format Size test & speed' });
});

/**
 * sends an HTML file that has :file from perftest/browserTests injected into it. Url '/test/charcode' will
 * run browser based test within that file (the .mjs suffix is added automatically)
 */
router.get('/test/:file', function(req, res, next) {
  res.render('script', { script: req.params.file });
});
module.exports = router;
