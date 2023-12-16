require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const app = express()
const Record = require("./models/record")
const cors = require("cors")

app.use(express.json())
app.use(cors())
app.use(express.static("dist"))

morgan.token("body", function (request, response, next) {
  return JSON.stringify(request.body)
})
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
)

app.get("/info", (request, response) => {
  const currentDate = new Date()
  Record.find({}).then((records) => {
    response.send(
      `<p>Phonebook has info for ${records.length} people</p>
      <p>${currentDate}</p>`
    )
  })
})

app.get("/api/persons", (request, response, next) => {
  Record.find({})
    .then((records) => {
      response.json(records)
    })
    .catch((error) => next(error))
})

app.get("/api/persons/:id", (request, response, next) => {
  Record.findById(request.params.id)
    .then((record) => {
      response.json(record)
    })
    .catch((error) => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const body = request.body

  const record = new Record({
    name: body.name,
    number: body.number,
  })

  record
    .save()
    .then((savedRecord) => {
      response.json(savedRecord)
    })
    .catch((error) => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body

  Record.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedResponse) => {
      response.send(updatedResponse)
    })
    .catch((error) => next(error))
})

app.delete("/api/persons/:id", (request, response) => {
  Record.findByIdAndDelete(request.params.id)
    .then((record) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response, next) => {
  response.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }

  next(error) //passes error to the default error handler
}
app.use(errorHandler) //error middleware should be the last loaded middleware

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`server running at port ${PORT}...`)
})
