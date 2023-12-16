const express = require("express")
const morgan = require("morgan")
const app = express()

app.use(express.json())

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body)
})

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
)

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
]

// const requestLogger = (request, response, next) => {
//   console.log("Method:", request.method)
//   console.log("Path:  ", request.path)
//   console.log("Body:  ", request.body)
//   console.log("---")
//   next()
// }
// app.use(requestLogger)
// manual way to log req,res

const generateId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((person) => person.id)) : 0
  return maxId + 1
}

app.get("/api/persons", (req, res) => {
  res.json(persons)
})

app.get("/info", (req, res) => {
  const date = new Date()
  const numberOfPersons = persons.length
  res.send(`Phonebook has info for ${numberOfPersons} people <p>${date}<p/>`)
})

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)

  const person = persons.find((person) => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete("/api/perosns/:id", (req, res) => {
  const id = Number(req.params.id)

  persons = persons.filter((person) => person.id !== id)

  res.status(204).end()
})

app.post("/api/persons", (req, res) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({
      error: "name missing",
    })
  } else if (!body.number) {
    return res.status(400).json({
      error: "number missing",
    })
  }

  const alreadyExists = persons.find((person) => person.name === body.name)
  if (alreadyExists) {
    return res.status(400).json({
      error: "name must be unique",
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    date: new Date(),
    id: generateId(),
  }

  persons = persons.concat(person)

  res.json(person)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`server running at port ${PORT}...`)
})
