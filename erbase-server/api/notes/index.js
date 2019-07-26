const express = require('express');
const app = express();
const db = require('../../utils/db');

// get notes
app.get('/', (req, res) => {
	let session = req.session;

	db.getNotes(session.userId)
	.then(out => {
		res.done(out);
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// create the note
app.post('/', (req, res) => {
	let session = req.session,
		value = req.body.data;

	db.createNote(session.userId, value)
	.then(out => {
		res.done({ value: out });
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// edit the note
app.put('/:id', (req, res) => {
	let session = req.session,
		id = req.params.id,
		value = req.body.data;

	db.editNote(session.userId, id, value)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// remove the note
app.delete('/:id', (req, res) => {
	let session = req.session,
		id = req.params.id;

	db.removeNote(session.userId, id)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});



module.exports = app;