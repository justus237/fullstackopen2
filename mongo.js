const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password> [<name> <number>]')
  process.exit(1)
}

const password = process.argv[2]

let name = null
let number = null
if (process.argv.length === 5) {
  name = process.argv[3]
  number = process.argv[4]
}

const url = `mongodb+srv://fullstackopenuser:${password}@cluster0.22nufpd.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (name !== null && number !== null && process.argv.length === 5) {
	mongoose
	  .connect(url)
	  .then((result) => {
		console.log('connected, trying to add new person')

	  const person = new Person({
			name: name,
			number: number,
	  })
	  
	  return person.save()

	})
	  .then(() => {
		console.log(`added ${name} number ${number} to phonebook`)
		return mongoose.connection.close()
	  })
	  .catch((err) => console.log(err))
}

else {
	mongoose
	  .connect(url)
	  .then((result) => {
		console.log('connected, fetching all people')
		
		return Person
		.find({})
		.then(result => {
		  result.forEach(person => {
			console.log(person.name, person.number)
		  })
		})
	})
	  .then(() => {
		return mongoose.connection.close()
	  })
	  .catch((err) => console.log(err))
}

