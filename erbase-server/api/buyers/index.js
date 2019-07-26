const express = require('express');
const app = express();
const db = require('../../utils/db');

// get buyers
app.get('/', (req, res) => {
    let session = req.session;

    db.getBuyers(session.userId)
    .then(out => {
        res.done({ value: out });
    })
    .catch(out => {
        res.error = out;
        res.done({ value: [] });
    });
});

// get user by id
app.get('/:id', (req, res) => {
    db.getBuyerById(req.params.id)
    .then(out => {
        res.done(out);
    })
    .catch(out => {
        res.error = out;
        res.done();
    });
});

// create new buyer
app.post('/', (req, res) => {
	let session = req.session;
    let data = req.body;

    data.realtor = session.userId;

    db.createBuyer(data)
    .then(out => {
        res.done();
    })
    .catch(out => {
        res.error = out;
        res.done();
    });
});

// update exist buyer
app.put('/', (req, res) => {
    let session = req.session;
    let data = req.body;

    db.updateBuyer(session.userId, data)
    .then(out => {
        res.done();
    })
    .catch(out => {
        res.error = out;
        res.done();
    });
});

// restore buyer
app.put('/restore/:id', (req, res) => {
    let session = req.session;

    db.restoreBuyer(session.userId, req.params.id)
    .then(out => {
        res.done();
    })
    .catch(out => {
        res.error = out;
        res.done();
    });
});

// remove buyer
app.delete('/:id', (req, res) => {
    let isCompletelyRemove = !!req.query.completely;
    let session = req.session;

    db.removeBuyer(session.userId, req.params.id, isCompletelyRemove)
    .then(out => {
        res.done();
    })
    .catch(out => {
        res.error = out;
        res.done();
    });
});

module.exports = app;