var express = require('express');
var cors = require('cors');
var request = require('request');
var _ = require('lodash');
var cheerio = require('cheerio');
var app = express();
var bodyParser = require('body-parser');

var social = require('./modules/seo.js');

app.use(bodyParser());
app.use(cors());

var corsOptions = {
  origin: "*"
};

var port = process.env.PORT || 5000;
var router = express.Router();

// ## Routes for our API 

// middleware to use for all requests
router.use('/', cors(corsOptions), function(req, res, next) {
  // ... check something
  console.log(req.query.url);
  next();
});

router.route('/seo')
  .get(function(req, res) {

    var url = req.query.url;

    social(url)
    .then(function(data) {
      return data;
    })
    .then(function(response) {
      res.json({ 
        seo: response
      });
    });
  });

// http://localhost:8080/api/social?url=http://mashable.com
app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);
