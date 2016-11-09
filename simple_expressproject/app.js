var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var app = express();
var ObjectID = require('mongodb').ObjectID;

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

app.post('/save-survey', function (req, res) {
  var survey = req.body.survey;
  var surveyId = req.body.surveyId;
  
  MongoClient.connect('mongodb://localhost:27017/survey', function(err, db) {
    if (err) {
      throw err;
    }
    var collection = db.collection('col1');
    var survey1 = {text: survey};
    if(surveyId) {
      var obj_id = new ObjectID(surveyId);
      collection.update({_id:obj_id}, {text: survey});
      //console.log("Done! saved", obj_id);
      return res.json({op: 'edit', status: "done"});
    }
    else {
      collection.insert([survey1], function (err, result) {
        if (err) {
          throw err;
        }
        return res.json({op: 'add', status: "done"});
      });
    }
  });
});

app.get('/get-surveies', function (req, res) {
  MongoClient.connect('mongodb://localhost:27017/survey', function(err, db) {
    if (err) {
      throw err;
    }
    var surveies = [];
    var collection = db.collection('col1');
    var cursor = collection.find();
    cursor.toArray(function (err, doc) {
      if (err) {
          console.log(err);
          return res(err);
      } else {
          return res.json(doc);
      }
    });
  });
});

app.get('/get-survey/:id', function (req, res) {
  MongoClient.connect('mongodb://localhost:27017/survey', function(err, db) {
    if (err) {
      throw err;
    }
    var id = req.params.id;
    var obj_id = new ObjectID(id);
    var surveies = [];
    var collection = db.collection('col1');
    var cursor = collection.find({_id: obj_id});
    cursor.toArray(function (err, doc) {
      if(err) {
          throw err;
      }
      else {
        //console.log(doc);
        return res.json(doc);
      }
    });
  });
});


app.get('/remove-survey/:id', function (req, res) {
  MongoClient.connect('mongodb://localhost:27017/survey', function(err, db) {
    if (err) {
      throw err;
    }
    var id = req.params.id;
    var obj_id = new ObjectID(id);
    var surveies = [];
    var collection = db.collection('col1');
    collection.remove({'_id': obj_id}, function(err) {
      if (err) {
        throw err;
      }
      return res.json({op: 'delete', status: "done"});
    });
  });
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});