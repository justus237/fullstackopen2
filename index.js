require('dotenv').config();
const express = require('express');

const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

morgan.token('body', (req) => {
	return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/info', (request, response, next) => {
	const currentTime = new Date().toString();
	Person
		.countDocuments({})
		.then((count) => {
			response.send(`<p>Phonebook has info for ${count} people</p><p>${currentTime}</p>`);
		})
		.catch((error) => next(error));
});

app.get('/api/persons', (request, response, next) => {
	Person
		.find({})
		.then((person) => {
			response.json(person);
		})
		.catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
	Person
		.findById(request.params.id)
		.then((person) => {
			if (person) {
				response.json(person);
			} else {
				response.status(404).end();
			}
		})
		.catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
	Person
		.findByIdAndRemove(request.params.id)
		.then(() => {
			response.status(204).end();
		})
		.catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
	const { name, number } = request.body;

	if (number === undefined && name === undefined) {
		return response.status(400).json({ error: 'name and number missing' });
	}

	// const person = {
	// 	name: body.name,
	// 	number: body.number,
	// };

	Person.findByIdAndUpdate(
		request.params.id,
		{ name, number },
		{ new: true, runValidators: true, context: 'query' }
	)
		.then((updatedPerson) => {
			response.json(updatedPerson);
		})
		.catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
	const { body } = request;

	if (body.name === undefined || body.number === undefined) {
		response.status(400).json({ error: 'name or number missing' }).end();
	}

	Person
		.findOne({ name: body.name })
		.then((foundPerson) => {
			if (foundPerson) {
				response.status(409).json({ error: 'Person already exists' }).end();
			} else {
				const person = new Person({
					name: body.name,
					number: body.number,
				});
				person
					.save()
					.then((savedPerson) => {
						response.json(savedPerson);
					})
					.catch((error) => next(error));
			}
		})
		.catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' });
	} if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message });
	}

	next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
