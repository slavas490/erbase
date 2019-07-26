const express = require('express');
const app = express();
const db = require('../../utils/db');

// get ads
app.get('/', (req, res) => {
	let session = req.session;

	db.getAds(session.userId)
	.then(out => {
		res.done({ value: out });
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// set ads in work
app.put('/active/:id', (req, res) => {
	let session = req.session;

	db.setActiveAd(session.userId, req.params.id)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// cancel active ads
app.delete('/active/:id', (req, res) => {
	let session = req.session;
	
	db.removeActiveAd(session.userId, req.params.id)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// set ads as deleted
app.delete('/:id', (req, res) => {
	db.removeAd(req.params.id)
	.then(out => {
		res.done(out);
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// update the ad data
app.put('/:id', (req, res) => {
	let comment = req.body.data || '';
	let session = req.session;

	db.updateAdComment(session.userId, req.params.id, comment)
	.then(out => {
		res.done(out);
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

module.exports = app;