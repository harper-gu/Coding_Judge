var express = require('express');
var router = express.Router();

var path = require('path');

router.get('/', function(req, res) {
  // send index.html to start client side
  res.senfFile('index.html', { root: paht.join(__dirname, '../../public')});
});

module.exports = router;
