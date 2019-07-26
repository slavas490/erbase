const express = require('express');
const app = express();
const db = require('../../utils/db');

// get streets
// url: /geo/street?name=[name]&limit=[limit], 
app.get('/street', (req, res) => {
	let name = req.query.name;
	let limit = req.query.limit || 5;

	db.searchStreetByName(name, limit)
	.then(out => {
		res.done({ value: out });
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

module.exports = app;