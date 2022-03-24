var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Format Size test & speed' });
});

router.get('/perf', function(req, res, next) {
  res.render('perftest', { title: 'Format Size test & speed' });
});
router.get('/perftest', function(req, res, next) {
  res.render('perftest', { title: 'Format Size test & speed' });
});
router.get('/test', function(req, res, next) {
  res.render('perftest', { title: 'Format Size test & speed' });
});
module.exports = router;
