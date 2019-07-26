const express = require('express');
const app = express();
const db = require('../../utils/db');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mailing = require('./mailing');
const getImageDimensions = promisify(require('image-size'));
const sendmail = require('sendmail')();

const senderEmail = 'support@erbase.ru';
const indexPath = path.join(__dirname, '../..');

const fileMove = (filePath, id, i, baseDir) => {
	db.createSellerImage(id, baseDir)
	.then(out => {
		let insertId = out.insertId;

		fs.rename(filePath, path.join(indexPath, 'uploads', baseDir, id + '_' + insertId + '.png'), (error) => {
			if(error) {
				console.warning(error)
			}
		});
	})
	.catch(error => {
		console.warning(error)
	});
};

// get sellers
app.get('/', (req, res) => {
	let session = req.session;

	db.getSellers(session.userId)
	.then(out => {
		res.done({ value: out });
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// get user by id
app.get('/:id', (req, res) => {
    db.getSellerById(req.params.id)
    .then(out => {
        res.done(out);
    })
    .catch(out => {
        res.error = out;
        res.done();
    });
});


// create new seller
app.post('/', upload.any(), async (req, res) => {
	let session = req.session;
	let data = req.body;
	let files = req.files,
		filesCFS = files.filter(item => item.fieldname == 'CFS'),
		fielsLayout = files.filter(item => item.fieldname == 'layout'),
		filesPhoto = files.filter(item => item.fieldname == 'photo');

	data.realtor = session.userId;

	// check images dimensions
	for(let i=0; i<files.length; i++) {
		try {
			let size = await getImageDimensions(files[i].path);

			if(size.height>1500 || size.width>1500) {
				res.error = 100;
				res.done();

				return;
			}
		}
		catch (error) {
			console.error('update exist seller', error);
		}
	}

	db.createSeller(data)
	.then(out => {
		let insertId = out.insertId;

		filesCFS.forEach((item, i) => fileMove(item.path, insertId, i, 'CFS'));
		fielsLayout.forEach((item, i) => fileMove(item.path, insertId, i, 'layout'));
		filesPhoto.forEach((item, i) => fileMove(item.path, insertId, i, 'photo'));

		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// update exist seller
app.put('/', upload.any(), async (req, res) => {
	let session = req.session;
	let data = req.body;
	let files = req.files,
		filesCFS = files.filter(item => item.fieldname == 'CFS'),
		fielsLayout = files.filter(item => item.fieldname == 'layout'),
		filesPhoto = files.filter(item => item.fieldname == 'photo');
	
	data.realtor = session.userId;

	// check images dimensions
	for(let i=0; i<files.length; i++) {
		try {
			let size = await getImageDimensions(files[i].path);

			if(size.height>1500 || size.width>1500) {
				res.error = 100;
				res.done();

				return;
			}
		}
		catch (error) {
			console.error('update exist seller', error);
		}
	}

	db.updateSeller(data)
	.then(out => {
		if(filesCFS.length > 0) {
			filesCFS.forEach((item, i) => fileMove(item.path, data.id, i, 'CFS'));
		}

		if(fielsLayout.length > 0) {
			fielsLayout.forEach((item, i) => fileMove(item.path, data.id, i, 'layout'));
		}

		if(filesPhoto.length > 0) {
			filesPhoto.forEach((item, i) => fileMove(item.path, data.id, i, 'photo'));
		}

		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// remove seller image
app.delete('/image/:type/:id', (req, res) => {
	let type = req.params.type;
	let id = req.params.id;
	let session = req.session;

	if(type == 'layout' || type == 'photo') {
		db.removeSellerImage(session.userId, id)
		.then(out => {
			if(out.id && out.sellerId) {
				fs.unlink(path.join(indexPath, 'uploads', type, out.sellerId + '_' + out.id + '.png'), (err) => {
					res.done();
				});
			}
		})
		.catch(out => {
			res.error = out;
			res.done();
		});
	}
});

// confirm the seller
app.put('/confirm/:id', (req, res) => {
	let session = req.session;

	db.confirmSeller(session.userId, req.params.id)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// cancel the seller
app.put('/cancel/:id', (req, res) => {
	let session = req.session;

	db.cancelSeller(session.userId, req.params.id)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// revision for the seller
app.put('/revision/:id', (req, res) => {
	let session = req.session;
	
	db.revisionSeller(session.userId, req.params.id, req.body.data)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});

// restore the seller
app.put('/restore/:id', (req, res) => {
	let session = req.session;

	db.restoreSeller(session.userId, req.params.id)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});


// remove seller
app.delete('/:id', (req, res) => {
	let session = req.session;
	let isCompletelyRemove = !!req.query.completely;

	db.removeSeller(session.userId, req.params.id, isCompletelyRemove)
	.then(out => {
		res.done();
	})
	.catch(out => {
		res.error = out;
		res.done();
	});
});


// mailing preview
app.get('/mailing/:ids', async (req, res) => {
	let query = req.query;
	let session = req.session;

	if (req.params.ids) {
		let mail = new mailing();
		await mail.setRealtorId(session.userId);
		await mail.setIds(req.params.ids);

		if (query.html) {
			res.end(mail.createHTML());
		}
		else {
			res.done({ html: mail.createHTML() });
		}
	}
	else {
		res.error = 'ids not defined';
		res.done();
	}
});

// mailing send mail
app.get('/mailing/:ids/:email', async (req, res) => {
	let params = req.params;
	let session = req.session;

	if (params.ids) {
		let mail = new mailing();
		await mail.setRealtorId(session.userId);
		await mail.setIds(req.params.ids);

		let html = mail.createHTML();
		let realtor = mail.getRealtor();

		sendmail({
			from: realtor.name + '<' + realtor.email + '>',
			to: params.email,
			subject: 'По вашему запросу подобраны варианты вторичного жилья',
			html
		});

		res.done();
	}
	else {
		res.error = 'ids not defined';
		res.done();
	}
});



module.exports = app;