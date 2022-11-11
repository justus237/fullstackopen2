const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose.connect(url)
	.then( () => {
		console.log('connected to MongoDB');
	})
	.catch((error) => {
		console.log('error connecting to MongoDB:', error.message);
	});

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: true
	},
	number: {
		type: String,
		minLength: 8,
		validate: {
			validator: function(v) {
				if (/^\d*$/.test(v)) {
					console.log('only numbers');
					return true;
				}
				if (/^\d{2}\d?-\d{2,}$/.test(v)) {
					console.log(v);
					return true;
				}
				return false;
			//return /\d{3}-\d{3}-\d{4}/.test(v);
			},
			message: props => `${props.value} is not a valid phone number!`
		},
		required: true
	},
});

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	}
});

module.exports = mongoose.model('Person', personSchema);