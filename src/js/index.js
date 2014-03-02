// Generated by CoffeeScript 1.7.1
(function() {
  var addImageOnDelay, app, db, express, gen, imagesearch, populating;

  express = require('express');

  db = require('./db');

  gen = require('./question_gen');

  imagesearch = require('./imagesearch');

  app = express();

  populating = false;

  app.get('/questions', function(req, res) {
    var limit, type, _ref;
    _ref = req.query, type = _ref.type, limit = _ref.limit;
    if (limit == null) {
      limit = 10;
    }
    limit = parseInt(limit);
    return db.getQuestions(type, limit).then(function(data) {
      return res.json(data);
    });
  });

  app.get('/questions/get/difficult', function(req, res) {
    var limit;
    limit = req.query.limit != null ? parseInt(req.query.limit) : 10;
    return db.getMostDifficultQuestions(limit, function(data) {
      return res.json(data);
    });
  });

  app.get('/questions/generate/random', function(req, res) {
    var count;
    count = req.query.count;
    return gen.generateRandomQuestionSet(count).then(function(data) {
      console.log(data);
      res.status(200);
      return res.send(data);
    });
  });

  app.get('/questions/generate', function(req, res) {
    var count, type;
    type = req.query.type;
    count = req.query.count != null ? parseInt(req.query.count) : 1;
    return gen.generateQuestions(type, count).then(function(data) {
      res.status(200);
      return res.send(data);
    });
  });

  app.get('/image', function(req, res) {
    var keyword;
    keyword = req.query.keyword;
    return imagesearch.findImage(keyword).then(function(data) {
      res.status(200);
      return res.send(data);
    });
  });

  app.post('/answer', function(req, res) {
    var food1, food2, image_name, score, type, _ref;
    _ref = req.params, type = _ref.type, food1 = _ref.food1, food2 = _ref.food2, score = _ref.score, image_name = _ref.image_name;
    return db.createQuestionOrUpdateScore(type, food1, food2, score, image_name).then(function() {
      return res.send(200);
    })["catch"](function() {
      return res.send(422);
    });
  });

  addImageOnDelay = function(row, interval) {
    return setTimeout(function() {
      return db.addImageFor(row);
    }, interval);
  };

  app.get('/populate', function(req, res) {
    if (populating) {
      res.send(403);
    }
    populating = true;
    return db.getAllFoods().then(function(data) {
      var i, row, _i, _len;
      i = 0;
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        row = data[_i];
        addImageOnDelay(row, i);
        i += 3000;
      }
      return res.send(200);
    });
  });

  app.listen(process.env.PORT || 3000);

}).call(this);
