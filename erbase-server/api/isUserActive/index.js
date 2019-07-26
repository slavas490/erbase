const express = require('express');
const app = express();
const db = require('../../utils/db');

app.use((req, res, next) => {
	let session = req.session;

	db.checkUserForActive(session.userId)
	.then(out => {
		if(out.isActive) {
			next();
		}
		else {
			throw 'error';
		}
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

module.exports = app;