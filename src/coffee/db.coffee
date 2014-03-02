mysql = require 'mysql'
imagesearch = require './imagesearch'
Q = require 'q'
qgen = require './question_gen'

connection = mysql.createConnection
  host: 'sql3.freemysqlhosting.net'
  user: 'sql331606'
  password: 'nS5!nZ4*'
  database: 'sql331606'
  port: 3306

exports.connectAndQuery = (query, queryArgs=[]) ->
  data = Q.defer()

  connection.query query, queryArgs, (err, rows, fields) ->
    if err then data.reject err else data.resolve rows

  return data.promise

exports.getMostDifficultQuestions = (limit) ->
  queryString = "SELECT * FROM questions WHERE num_answers >= 5 ORDER BY average_score LIMIT ?"
  return exports.connectAndQuery queryString, [limit]

exports.getQuestions = (type, limit) ->
  tableName = mysql.escapeId(type + '_questions')
  queryString = "SELECT * FROM questions INNER JOIN #{tableName} ON #{tableName}.qid = questions.id LIMIT ?"

  return exports.connectAndQuery queryString, [limit]

getNextQuestionId = ->
  nextId = Q.defer()

  exports.connectAndQuery('SELECT COUNT(*) FROM questions').then (data) ->
    nextId.resolve data['COUNT(*)']

  nextId.promise

doesQuestionExist = (type, food1, food2) ->
  weExist = Q.defer()
  console.log("DOES IT? " + food1 + ", " + food2)
  
  queryString = ""
  if (type == qgen.a_per_b_question)
    queryString = 'SELECT COUNT(qID) FROM composition_questions WHERE food1 = ? AND food2 = ?;'
  else if (type == qgen.comparision_question)
    queryString = 'SELECT COUNT(qID) FROM compare_questions WHERE food1 = ? AND food2 = ?'
  else
    throw new Error("Bad question type")

  exports.connectAndQuery(queryString, [food1, food2]).then (data) ->
      console.log("a per b: ")
      console.log(data)
      weExist.resolve(data != null && parseInt(data[0]["COUNT(qID)"]) != 0)

  weExist.promise

getIDForQuestionData = (type, food1, food2) ->
  getID = Q.defer()
  
  queryString = ""
  if (type == qgen.a_per_b_question)
    queryString = 'SELECT qID FROM composition_questions WHERE food1 = ? AND food2 = ?;'
  else if (type == qgen.comparision_question)
    queryString = 'SELECT qID FROM compare_questions WHERE food1 = ? AND food2 = ?'
  else
    throw new Error("Bad question type")

  exports.connectAndQuery(queryString, [food1, food2]).then (data) ->
      console.log("a per b: ")
      console.log(data)
      if (data? && data[0]?)
        getID.resolve(parseInt(data[0]["qID"]))
      else
        getID.reject()

  getID.promise

updateQuestionScore = (type, food1, food2, score) ->
  tableName = ""
  if (type == qgen.a_per_b_question)
    tableName = 'composition_questions'
  else if (type == qgen.comparision_question)
    tableName = 'compare_questions'
  else 
    throw new Error("Stupid")

  getIDForQuestionData(type, food1, food2)
  query = "UPDATE questions SET num_responses = num_responses + 1, total_score = total_score + ?
          WHERE type = ? AND qID = (SELECT qID FROM "+tableName+"WHERE food1 = ? and food2 = ?"

  exports.connectAndQuery query, [score, type, food1, food2]

createQuestion = (type, food1, food2, score) ->
  console.log("Creating a question in table")
  query = "INSERT INTO questions (type, total_score, num_responses) VALUES (?, ?, ?)"
  exports.connectAndQuery(query, [type, parseInt(score), 1]).then (data) ->
    console.log("Success inserting!");
    query2 = ""
    if (type == qgen.a_per_b_question)
      query2 = 'INSERT INTO composition_questions VALUES (LAST_INSERT_ID(), ?, ?);'
    else if (type == qgen.comparision_question)
      query2 = 'INSERT INTO compare_questions VALUES (LAST_INSERT_ID(), ?, ?)'
    else
      throw new Error("Bad question type")

    exports.connectAndQuery query, [parseInt(food1), parseInt(food2)]



exports.createQuestionOrUpdateScore = (type, food1, food2, score) ->
  console.log("efhigehrwgekrwguieks")
  doesQuestionExist(type, food1, food2).then (exists) ->
    if exists
      console.log("Exists!");
      updateQuestionScore(type, food1, food2, score)
    else
      console.log("DOESN'T EXIST???")
      createQuestion(type, food1, food2, score)
      #exports.connectAndQuery 'INSERT INTO questions (type, food1, food2, '

exports.getAllFoods = ->
  exports.connectAndQuery 'SELECT * FROM all_foods'

exports.addImageFor = (food) ->
  imagesearch.findImage(food.Name).then (url) ->
    exports.connectAndQuery 'INSERT INTO food_images (id, url) VALUES (?, ?)', [food.id, url]
