const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.json())
morgan.token('postcontent', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postcontent'))

const cors = require('cors')
app.use(cors())

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

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if(person) {
	response.json(person)
  } else {
  	response.status(404).end()
  }
})

app.post('/api/persons', (request, response) => {
	let data = request.body
	if (!request.body.name) {
		return response.status(400).json({ 
	     	error: 'name is missing' 
	    })
	} else if (!request.body.number) {
		return response.status(400).json({ 
      		error: 'number missing' 
    	})
	}

	if(persons.find(person => person.name === request.body.name)) {
		return response.status(400).json({ 
      		error: 'name must be unique' 
    	})
	}

 	const new_id = Math.floor(Math.random() * 1000000000)
 	data.id = new_id
 	persons = persons.concat(data)
 	response.json(persons)
})


app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
  console.log(persons)
})

app.get('/info', (request, response) => {
  let date = new Date()
  response.send(`<p>Phonebook has info for ${persons.length} people </p><p>${date}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})