// Generated by CoffeeScript 1.7.1
(function() {
  var Q, connection, createQuestion, doesQuestionExist, getIDForQuestionData, getNextQuestionId, mysql, qgen, updateQuestionScore;

  mysql = require('mysql');

  Q = require('q');

  qgen = require('./question_gen');

  connection = mysql.createConnection({
    host: 'sql3.freemysqlhosting.net',
    user: 'sql331606',
    password: 'nS5!nZ4*',
    database: 'sql331606',
    port: 3306
  });

  exports.connectAndQuery = function(query, queryArgs) {
    var data;
    if (queryArgs == null) {
      queryArgs = [];
    }
    data = Q.defer();
    connection.query(query, queryArgs, function(err, rows, fields) {
      if (err) {
        return data.reject(err);
      } else {
        return data.resolve(rows);
      }
    });
    return data.promise;
  };

  exports.getMostDifficultQuestions = function(limit) {
    var queryString;
    queryString = "SELECT * FROM questions WHERE num_answers >= 5 ORDER BY average_score LIMIT ?";
    return exports.connectAndQuery(queryString, [limit]);
  };

  exports.getQuestions = function(type, limit) {
    var queryString, tableName;
    tableName = mysql.escapeId(type + '_questions');
    queryString = "SELECT * FROM questions INNER JOIN " + tableName + " ON " + tableName + ".qid = questions.id LIMIT ?";
    return exports.connectAndQuery(queryString, [limit]);
  };

  getNextQuestionId = function() {
    var nextId;
    nextId = Q.defer();
    exports.connectAndQuery('SELECT COUNT(*) FROM questions').then(function(data) {
      return nextId.resolve(data['COUNT(*)']);
    });
    return nextId.promise;
  };

  doesQuestionExist = function(type, food1, food2) {
    var queryString, weExist;
    weExist = Q.defer();
    console.log("DOES IT? " + food1 + ", " + food2);
    queryString = "";
    if (type === qgen.a_per_b_question) {
      queryString = 'SELECT COUNT(qID) FROM composition_questions WHERE food1 = ? AND food2 = ?;';
    } else if (type === qgen.comparision_question) {
      queryString = 'SELECT COUNT(qID) FROM compare_questions WHERE food1 = ? AND food2 = ?';
    } else {
      throw new Error("Bad question type");
    }
    exports.connectAndQuery(queryString, [food1, food2]).then(function(data) {
      console.log("a per b: ");
      console.log(data);
      return weExist.resolve(data !== null && parseInt(data[0]["COUNT(qID)"]) !== 0);
    });
    return weExist.promise;
  };

  getIDForQuestionData = function(type, food1, food2) {
    var getID, queryString;
    getID = Q.defer();
    queryString = "";
    if (type === qgen.a_per_b_question) {
      queryString = 'SELECT qID FROM composition_questions WHERE food1 = ? AND food2 = ?;';
    } else if (type === qgen.comparision_question) {
      queryString = 'SELECT qID FROM compare_questions WHERE food1 = ? AND food2 = ?';
    } else {
      throw new Error("Bad question type");
    }
    exports.connectAndQuery(queryString, [food1, food2]).then(function(data) {
      console.log("a per b: ");
      console.log(data);
      if ((data != null) && (data[0] != null)) {
        return getID.resolve(parseInt(data[0]["qID"]));
      } else {
        return getID.reject();
      }
    });
    return getID.promise;
  };

  updateQuestionScore = function(type, food1, food2, score) {
    var query, tableName;
    tableName = "";
    if (type === qgen.a_per_b_question) {
      tableName = 'composition_questions';
    } else if (type === qgen.comparision_question) {
      tableName = 'compare_questions';
    } else {
      throw new Error("Stupid");
    }
    getIDForQuestionData(type, food1, food2);
    query = "UPDATE questions SET num_responses = num_responses + 1, total_score = total_score + ? WHERE type = ? AND qID = (SELECT qID FROM " + tableName + "WHERE food1 = ? and food2 = ?";
    return exports.connectAndQuery(query, [score, type, food1, food2]);
  };

  createQuestion = function(type, food1, food2, score) {
    var query;
    console.log("Creating a question in table");
    query = "INSERT INTO questions (type, total_score, num_responses) VALUES (?, ?, ?)";
    return exports.connectAndQuery(query, [type, parseInt(score), 1]).then(function(data) {
      var query2;
      console.log("Success inserting!");
      query2 = "";
      if (type === qgen.a_per_b_question) {
        query2 = 'INSERT INTO composition_questions VALUES (LAST_INSERT_ID(), ?, ?);';
      } else if (type === qgen.comparision_question) {
        query2 = 'INSERT INTO compare_questions VALUES (LAST_INSERT_ID(), ?, ?)';
      } else {
        throw new Error("Bad question type");
      }
      return exports.connectAndQuery(query, [parseInt(food1), parseInt(food2)]);
    });
  };

  exports.createQuestionOrUpdateScore = function(type, food1, food2, score) {
    console.log("efhigehrwgekrwguieks");
    return doesQuestionExist(type, food1, food2).then(function(exists) {
      if (exists) {
        console.log("Exists!");
        return updateQuestionScore(type, food1, food2, score);
      } else {
        console.log("DOESN'T EXIST???");
        return createQuestion(type, food1, food2, score);
      }
    });
  };

}).call(this);
