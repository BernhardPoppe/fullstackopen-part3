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

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(person => {
     response.json(person)
  })
  .catch(error => next(error))
})


app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    number:body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true})
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  let body = request.body
  if (!body.name) {
    return response.status(400).json({ 
        error: 'name is missing' 
      })
  } else if (!body.number) {
    return response.status(400).json({ 
          error: 'number missing' 
      })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
  .then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
})



app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count =>{
      let date = new Date()
      response.send(`<p>Phonebook has info for ${count} people </p><p>${date}</p>`)
  })
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  
  Person.findByIdAndDelete(id)
  .then(() => res.status(204).end())
  .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }  
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})