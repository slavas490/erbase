const express = require('express');
const app = express();
const httpCode = require('../../utils/httpCode');
const db = require('../../utils/db');

// skip authenticate (signup)
app.post('/user', (req, res) => {
	req.skipAuthorize = true;
	req.next();
});

// skip authenticate (confirm)
app.post('/user/confirm/*', (req, res) => {
	req.skipAuthorize = true;
	req.next();
});

// skip authenticate (forgot)
app.get('/user/forgot/*', (req, res) => {
	req.skipAuthorize = true;
	req.next();
});


// authenticate
app.post('/', (req, res) => {
	let data = req.body,
		session = req.session;

	db.userAuthenticate(data.phone, data.password)
	.then(out => {
		if(out && !out.isBlocked && out.isEmailConfirm) {
			session.isLoggedIn = true;
			session.userId = out.id;
			session.isAdmin = out.isAdmin;
			res.done();
		}
		else {
			req.next();
		}
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// check for authenticate
app.use((req, res) => {
	let session = req.session;

	if(!session.isLoggedIn && !req.skipAuthorize) {
		res.code = httpCode.CLIENT_ERROR_UNAUTHORIZED;
		res.error = 1;
		res.done();
	}
	else {
		req.next();
	}
});

module.exports = app;