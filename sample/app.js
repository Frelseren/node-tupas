/* eslint no-console: 0 */

var express = require('express')
  , https = require('https')
  , fs = require('fs')
  , app = express()
  , _ = require('underscore')._
  , moment = require('moment')
  , config = require('../config.json');

var requestIdCounter = 0;

var globalOpts = {
  appHandler: app,
  hostUrl: 'https://localhost:' + config.port
};

var tupas = require(__dirname + '/../tupas').create(globalOpts);

tupas.on('success', function (req, res) {
  console.log(req.query);
  res.status(200).send('<html><h1 id=\'success\'>SUCCESS</h1></html>');
});

tupas.on('mac-check-failed', function (req, res) {
  res.status(400).send('<html><h1 id=\'mac-check-failed\'>MAC-CHECK-FAILED</h1></html>');
});

tupas.on('cancel', function (req, res) {
  res.status(200).send('<html><h1 id=\'cancel\'>CANCEL</h1></html>');
});

tupas.on('reject', function (req, res) {
  res.status(200).send('<html><h1 id=\'reject\'>REJECT</h1></html>');
});

var sslOptions = {
  key: fs.readFileSync(__dirname + '/certs/server.key'),
  cert: fs.readFileSync(__dirname + '/certs/server.crt'),
  ca: fs.readFileSync(__dirname + '/certs/ca.crt'),
  requestCert: false,
  rejectUnauthorized: false
};

app.use(express.static(__dirname + '/css'));

app.get('/', function (req, res) {
  var now = moment().format('YYYYMMDDhhmmss');
  requestIdCounter++;
  // Developer should implement requestId so that it's unique.
  var requestId = now + (requestIdCounter % 100000).toString();

  var bankForms = _.map(tupas.banks, function (bankId) {
    return tupas.tupasButton(bankId, 'FI', requestId);
  });
  var html = '<html>'+
             '<head><link rel=\'stylesheet\' type=\'text/css\' href=\'app.css\'></head>'+
             '<body><div class=\'tupas-buttons\'>' + bankForms.join('') + '</div></body>'+
             '</html>';

  res.status(200).send(html);
});

var server = https.createServer(sslOptions, app);

exports = module.exports = server;
// delegates user() function
exports.use = function () {
  app.use.apply(app, arguments);
};
