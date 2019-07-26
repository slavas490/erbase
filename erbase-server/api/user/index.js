const express = require('express');
const app = express();
const db = require('../../utils/db');
const  sha256 = require('sha256');
const sendmail = require('sendmail')();

const senderEmail = 'support@erbase.ru';
const regEmailHTML = '<div><strong>Для подтверждения регистрации перейдите по ссылке:</strong></div>\
<div><a href="http://erbase.ru/c/{link}">http://erbase.ru/c/{link}</a></div>\
<br>\
<div>Не сообщайте свой пароль никогда и никому, даже сотрудникам тех.поддержки и администраторам данного сервиса.\
При возникновении вопросов пишите на email <a href="mailto:support@erbase.ru">support@erbase.ru</a></div>\
<br>\
<div>С наилучшими пожеланиями,</div>\
<div><a href="erbase.ru">erbase.ru</a></div>';

const forgotEmailHTML = '<div>Для входа на сайт используйте номер телефона, указанный при регистрации и новый пароль: <strong>{password}</strong></div>\
<br>\
<div>Не сообщайте свой пароль никогда и никому, даже сотрудникам тех.поддержки и администраторам данного сервиса.\
При возникновении вопросов пишите на email <a href="mailto:support@erbase.ru">support@erbase.ru</a></div>\
<br>\
<div>С наилучшими пожеланиями,</div>\
<div><a href="erbase.ru">erbase.ru</a></div>';

const userConfirmLink = (id, password, phone) => {
	return id + ':' + sha256(id + password + phone);
};

const randomText = (length) => {
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let text = '';

	for (let i = 0; i<length; i++) {
    	text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}

// create user
app.post('/', (req, res) => {
	let session = req.session;
	let user = req.body;

	db.createUser(user)
	.then(out => {
		user.id = out.insertId;

		let link = userConfirmLink(user.id, user.password, user.phone);
		let html = regEmailHTML.replace(/(\{link\})/g, link);
		html = html.replace(/(\{phoneNumber\})/g, user.phone);
		html = html.replace(/(\{password\})/g, user.password);

		sendmail({
			from: senderEmail,
			to: user.email,
			subject: 'Регистрация на сайте erbase.ru',
			html: html
		});

		res.done();
	})
	.catch(out => {
		if(out.code == 'ER_DUP_ENTRY') {
			res.error = 100;
		}
		else {
			res.error = out;
		}
		
		res.done();
	});
});

// confirm user
app.post('/confirm/:id', (req, res) => {
	let session = req.session;
	let id = req.params.id;
	let reqKey = id + ':' + req.body.value;

	db.getUser(id, ['password'])
	.then(user => {
		let userKey = userConfirmLink(user.id, user.password, user.phone);

		if(reqKey != userKey) {
			res.error = 2;
			return null;
		}
		else {
			return db.confirmUser(user.id);
		}
	})
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// forgot password
app.get('/forgot/:email', (req, res) => {
	let email = req.params.email;
	let password = randomText(8);

	db.updateUserPasswordByEmail(email, sha256(password))
	.then(out => {
		if(out.affectedRows > 0) {
			let html = forgotEmailHTML.replace('{password}', password);

			sendmail({
				from: senderEmail,
				to: email,
				subject: 'Восстановление пароля на сайте erbase.ru',
				html: html
			});
		}
		else {
			res.error = 'db.updateUserPasswordByEmail: nothing affected (email: ' + email + ')';
		}

		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// get self info
app.get('/', (req, res) => {
	let session = req.session;

	if(session.userId > 0) {
		db.getUser(session.userId)
		.then(out => {
			res.done(out);
		})
		.catch(out => {
			res.error = out;
			res.done();
		});
	}
	else {
		res.done();
	}
});

// update info
app.put('/', (req, res) => {
	let session = req.session;

	if(session.userId > 0) {
		db.updateUserInfo(session.userId, req.body)
		.then(out => {
			res.done();
		})
		.catch(out => {
			res.error = out;
			res.done();
		});
	}
	else {
		res.done();
	}
});

// update password
app.put('/authentication', (req, res) => {
	let session = req.session;

	if(session.userId > 0) {
		db.updateUserPassword(session.userId, req.body)
		.then(out => {
			res.done();
		})
		.catch(out => {
			res.error = out;
			res.done();
		});
	}
	else {
		res.done();
	}
});

// get user by id
app.get('/user/:id', (req, res) => {
	db.getUser(req.params.id)
	.then(out => {
		res.done(out)
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
})


// destroy the session
app.get('/logout', (req, res) => {
	req.session.destroy();
	res.done();
});

module.exports = app;