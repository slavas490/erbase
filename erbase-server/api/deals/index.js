const express = require('express');
const app = express();
const db = require('../../utils/db');

// get deals
app.get('/', (req, res) => {
	let session = req.session;

	db.getDeals(session.userId)
	.then(out => {
		res.done({ value: out });
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// create new deal
app.post('/', (req, res) => {
	let session = req.session;
	let data = req.body;

	data.realtor = session.userId;

	db.createDeal(data)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// change the deal process status
app.put('/:id/:name/:status', (req, res) => {
	let id = req.params.id,
		name = req.params.name,
		status = req.params.status,
		session = req.session;

	db.changeDealStatus(session.userId, id, name, status)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// delete deal
app.delete('/:id', (req, res) => {
	let session = req.session;
	let data = req.body;

	db.deleteDeal(session.userId, req.params.id, data)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// update deal
app.put('/', (req, res) => {
	let data = req.body;
	let session = req.session;

	db.updateDeal(session.userId, data)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

module.exports = app;