mysql = require 'mysql'
imagesearch = require './imagesearch'
Q = require 'q'

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
  weExist = q.defer()

  exports.connectAndQuery 'SELECT COUNT(*) FROM questions WHERE type = ? AND food1 = ? AND food2 = ?', [type, food1, food2], (data) ->
    weExist.resolve(parseInt(data["COUNT(*)"]) is 0)

  weExist.promise

updateQuestionScore = (type, food1, food2, score) ->
  query = "UPDATE questions SET num_responses = num_responses + 1, total_score = total_score + ? WHERE type = ? AND food1 = ? AND food2 = ?"
  exports.connectAndQuery query, [score, type, food1, food2]

createQuestion = (type, food1, food2, score) ->
  query = "INSERT INTO questions (type, food1, food2, num_responses, total_score) VALUES (?, ?, ?, ?, ?)"
  exports.connectAndQuery query, [type, food1, food2, 1, score]

createQuestionOrUpdateScore = (type, food1, food2, score) ->
  doesQuestionExist(type, food1, food2).then (exists) ->
    if exists
      updateQuestionScore(type, food1, food2, score)
    else
      createQuestion(type, food1, food2, score)
      #exports.connectAndQuery 'INSERT INTO questions (type, food1, food2, '

exports.getAllFoods = ->
  exports.connectAndQuery 'SELECT * FROM all_foods'

exports.addImageFor = (food) ->
  imagesearch.findImage(food.Name).then (url) ->
    exports.connectAndQuery 'INSERT INTO food_images (id, url) VALUES (?, ?)', [food.id, url]
