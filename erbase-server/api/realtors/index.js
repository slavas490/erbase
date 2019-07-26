const express = require('express');
const app = express();
const db = require('../../utils/db');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });
const moveFile = require('move-file');

const indexPath = path.join(__dirname, '../..');

const fileMove = (filePath, id, i, baseDir) => {
	moveFile(path.join(indexPath, filePath), path.join(indexPath, 'uploads', baseDir, id + '.png'));
};

// get realtors
app.get('/', (req, res) => {
    let session = req.session;

    db.getUsers(session.userId)
    .then(out => {
        res.done({ value: out });
    })
    .catch(out => {
        res.error = out;
        res.done({ value: [] });
    });
});

// update user
app.put('/:id', upload.any(), (req, res) => {
    let session = req.session;
    let data = req.body;
	let files = req.files,
		fileDesignLogo = files.filter(item => item.fieldname == 'designLogo');
    let id = req.params.id;

    if(id > 0) {
    	data.customLogo = +(fileDesignLogo.length > 0);

        db.updateUser(session.userId, id, data)
        .then(out => {
        	if(fileDesignLogo.length > 0) {
				fileDesignLogo.forEach((item, i) => fileMove(item.path, data.id, i, 'designLogo'));
			}

            res.done();
        })
        .catch(out => {
            res.error = out;
            res.done();
        });
    }
    else {
        res.error = 1;
        res.done();
    }
});

// block/unblock
app.put('/:id/isblocked', (req, res) => {
    let session = req.session;

    db.blockUser(session.userId, req.params.id, +req.body.value)
    .then(out => {
        res.done();
    })
    .catch(out => {
        res.error = out;
        res.done();
    });
});

// remove realtor logo
app.delete('/logo/:id', (req, res) => {
	let session = req.session;

    db.removeUserLogo(session.userId, +req.params.id)
    .then(out => {
        res.done();
    })
    .catch(out => {
        res.error = out;
        res.done();
    });
});

module.exports = app;