mysql = require 'mysql'
Q = require 'q'

connection = mysql.createConnection
  host: 'sql3.freemysqlhosting.net'
  user: 'sql330935'
  password: 'fW2!cZ8%'
  database: 'sql330935'

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