require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.json())
morgan.token('postcontent', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postcontent'))

const cors = require('cors')
app.use(cors())
app.use(express.static('build'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
  })
})


app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => {
            return response.status(400).json({ 
              error: 'no entry for the id' 
            })
        })
})


app.post('/api/persons', (request, response) => {
  let data = request.body
  if (!data.name) {
    return response.status(400).json({ 
        error: 'name is missing' 
      })
  } else if (!data.number) {
    return response.status(400).json({ 
          error: 'number missing' 
      })
  }

  const person = new Person({
    name: data.name,
    number: data.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})



app.get('/info', (request, response) => {
  let date = new Date()
  response.send(`<p>Phonebook has info for ${persons.length} people </p><p>${date}</p>`)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})