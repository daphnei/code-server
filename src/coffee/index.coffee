express = require 'express'
db = require './db'
gen = require './question_gen'
imagesearch = require './imagesearch'

app = express()
populating = no

app.get('/questions', (req, res) ->
  {type, limit} = req.query
  limit ?= 10
  limit = parseInt(limit)

  db.getQuestions(type, limit).then (data) ->
    res.json data
)

app.get '/questions/get/difficult', (req, res) ->
  limit = if req.query.limit? then parseInt(req.query.limit) else 10
  db.getMostDifficultQuestions(limit, (data) ->
    res.json data
  )

app.get '/questions/generate/random', (req, res) ->
  count = req.query.count
  gen.generateRandomQuestionSet(count).then (data) ->
    console.log data
    res.status(200)
    res.send(data)

app.get '/questions/generate', (req, res) ->
  type = req.query.type
  count = if req.query.count? then parseInt(req.query.count) else 1
  index = if req.query.index? then parseInt(req.query.index) else 1
  console.log("INDEX: " + index)
  gen.generateQuestions(type, count, index).then (data) ->
    res.status(200)
    res.send(data)

app.get '/image', (req, res) ->
  keyword = req.query.keyword
  imagesearch.findImage(keyword).then (data) ->
    res.status(200)
    res.send(data)

app.post '/answer', (req, res) ->
  {type, food1, food2, score} = req.query
  console.log(req.query)
  db.createQuestionOrUpdateScore(type, food1, food2, score).then ->
    res.send(200)
  .catch ->
    res.send(422)

addImageOnDelay = (row, interval) ->
  setTimeout ->
    db.addImageFor(row)
  , interval

app.get '/populate', (req, res) ->
  res.send(403) if populating

  populating = yes
  db.getAllFoods().then (data) ->
    i = 0
    for row in data
      addImageOnDelay(row, i)
      i += 3000

    res.send(200)

app.listen(process.env.PORT or 3000)
