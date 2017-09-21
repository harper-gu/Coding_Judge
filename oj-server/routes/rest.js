var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var problemService = require('../services/problemService');

var nodeRestClient = require('node-rest-client').Client;
var restClient = new nodeRestClient();

var EXECUTOR_SERVER_URL = 'http://localhost:5000/build_and_run';

restClient.registerMethod('build_and_run', EXECUTOR_SERVER_URL, 'POST');

router.get('/problems', function(req, res) {
  problemService.getProblems()
    .then(problems => res.json(problems));
});

router.get('/problems/:id', function(req, res) {
  var id = req.params.id;
  //'+' transforms id from string to number
  problemService.getProblem(+id)
    .then(problem => res.json(problem));
});

router.post('/problems', jsonParser, function(req, res) {
  console.log(req.body);
  problemService.addProblem(req.body)
    .then(problem => {
      res.json(problem);
    },
    error => {
      res.status(400).send('Problem name already exists');
    });
})

router.post('/build_and_run', jsonParser, function(req, res) {
  const code = req.body.userCode;
  const lang = req.body.lang;
  console.log('Ready to execute');
  restClient.methods.build_and_run(
    {
      data : JSON.stringify({
        code : code,
        lang : lang,
      }),
      headers: { 'content-type' : 'application/josn'}
    }, (data, response) => {
      console.log(data.toString());
      payload = JSON.parse(data.toString())
      console.log('received from execution server');
      // const text = `Build Output: ${payload['build']},
      // Execution Output: ${payload['run']}`;
      // exe_result = {}
      // exe_result['text'] = text;
      res.json(payload);
    }
  );
});


module.exports = router;
