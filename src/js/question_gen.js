// Generated by CoffeeScript 1.7.1
(function() {
  var Q, db, fields, imagesearch, index, insertQuestion, make_food, units, _;

  index = require('./index');

  db = require('./db');

  imagesearch = require('./imagesearch');

  Q = require('q');

  _ = require('underscore');

  exports.a_per_b_question = "composition";

  exports.comparision_question = "compare";

  fields = ["Energy", "Protein", "Carbohydrate", "Total_Sugar", "Cholesterol", "Vitamin_A", "Calcium", "Iron"];

  units = ["kcal", "g", "g", "g", "mg", "RAE", "mg", "mg"];

  insertQuestion = function(question) {};

  make_food = function(id, name, genre, value, measure, unit, url) {
    return {
      id: id,
      name: name,
      genre: genre,
      value: value,
      serving_measure: measure,
      serving_unit: unit,
      image_url: url
    };
  };

  exports.generateQuestions = function(type, count, index) {
    var chosen_field, deferred, queryString, rand_index, unit_for_chosen;
    deferred = Q.defer();
    queryString = null;
    if (type === exports.a_per_b_question) {
      chosen_field = '';
      unit_for_chosen = '';
      if ((index != null)) {
        chosen_field = fields[index];
        unit_for_chosen = units[index];
      } else {
        rand_index = parseInt(Math.random() * fields.length);
        chosen_field = fields[rand_index];
        unit_for_chosen = units[rand_index];
      }
      queryString = "select t1.Name as Name1, t1.Genre as Genre1, t1.Measure as Measure1, t1.Unit as Unit1, t1." + chosen_field + " as Value1, t1.id as id1, t1.url as url1, t2.Name as Name2, t2.Genre as Genre2, t2.Measure as Measure2, t2.Unit as Unit2, t2." + chosen_field + " as Value2, t2.id as id2, t2.url as url2 FROM all_foods t1, all_foods t2 WHERE t1." + chosen_field + " > 0 and t2." + chosen_field + " > 0 AND t1." + chosen_field + " >= 2 * t2." + chosen_field + " AND t1." + chosen_field + " <= 10 * t2." + chosen_field + " ORDER BY RAND() LIMIT " + count + ";";
    } else if (type === exports.comparision_question) {
      chosen_field = '';
      unit_for_chosen = '';
      console.log("ehjfiowejgrowie: " + index);
      if ((index != null)) {
        chosen_field = fields[index];
        unit_for_chosen = units[index];
      } else {
        rand_index = parseInt(Math.random() * fields.length);
        chosen_field = fields[rand_index];
        unit_for_chosen = units[rand_index];
      }
      queryString = "SELECT t1.Name as Name1, t1.Genre as Genre1, t1.Unit as Unit1, t1.Measure as Measure1, t1." + chosen_field + " as Value1, t1.id as id1, t1.url as url1, t2.Name as Name2, t2.Genre as Genre2, t2.Unit as Unit2, t2.Measure as Measure2, t2." + chosen_field + " as Value2, t2.id as id2, t2.url as url2 FROM all_foods t1, all_foods t2 WHERE t1." + chosen_field + " > 0 AND t2." + chosen_field + " > 0 AND  t2." + chosen_field + " >= 2 AND t1." + chosen_field + " >= 2 * t2." + chosen_field + " AND t1." + chosen_field + " < 5 * t2." + chosen_field + " ORDER BY RAND() LIMIT " + count + ";";
    }
    if (queryString !== null) {
      console.log("Starting query " + queryString);
      db.connectAndQuery(queryString).then(function(data) {
        var data_to_send, element, question, _i, _len;
        console.log("Query finished");
        data_to_send = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          question = data[_i];
          element = {
            question_type: type,
            parameter: chosen_field,
            unit: unit_for_chosen,
            food1: make_food(question.id1, question.Name1, question.Genre1, question.Value1, question.Measure1, question.Unit1, question.url1),
            food2: make_food(question.id2, question.Name2, question.Genre2, question.Value2, question.Measure2, question.Unit2, question.url2)
          };
          data_to_send.push(element);
        }
        return deferred.resolve(data_to_send);
      });
    } else {
      deferred.reject();
    }
    return deferred.promise;
  };

  exports.generateRandomQuestionSet = function(count) {
    var generatedDataPromises, i, questions, type, types, _i;
    if (count == null) {
      count = 10;
    }
    questions = Q.defer();
    console.log("Starting to generate random questions");
    generatedDataPromises = [];
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      types = [exports.a_per_b_question, exports.comparision_question];
      type = types[parseInt(Math.random() * types.length)];
      generatedDataPromises.push(exports.generateQuestions(type, 1));
    }
    Q.all(generatedDataPromises).then(function(allData) {
      var flattenData;
      console.log("Finished getting all data");
      flattenData = _.flatten(allData, true);
      return questions.resolve(flattenData);
    });
    return questions.promise;
  };

}).call(this);
