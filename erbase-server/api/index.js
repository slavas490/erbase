const express = require('express');
const app = express();
const httpCode = require('../utils/httpCode');

const authenticate = require('./authenticate');
const checkUserForActive = require('./isUserActive');
const user = require('./user');
const ads = require('./ads');
const sellers = require('./sellers');
const buyers = require('./buyers');
const deals = require('./deals');
const realtors = require('./realtors');
const notes = require('./notes');
const geo = require('./geo');

// authenticate
app.use(authenticate);

// user
app.use('/user', user);

// check for user is active
app.use(checkUserForActive);

// ads
app.use('/ads', ads);

// sellers
app.use('/sellers', sellers);

// buyers
app.use('/buyers', buyers);

// deals
app.use('/deals', deals);

// realtors
app.use('/realtors', realtors);

// notes
app.use('/notes', notes);

// geo
app.use('/geo', geo);

module.exports = app;