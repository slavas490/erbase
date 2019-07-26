const express = require('express');
const app = express();
const api = require('./api');
const response = require('./utils/response');
const rentGrabber = require('./utils/rentGrabber');
const session = require('express-session');
const sessionStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const port = 8080;

// enable cors
app.use(cors({
	credentials: true,
	origin: 'http://localhost:3000'
}));

// static files
app.use('/static', express.static(path.join(__dirname, 'uploads')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

// self-formatted response
app.use(response);

// session support
app.set('trust proxy', 1) // trust first proxy
app.use(session({
	store: new sessionStore({
		ttl: 14400000,
		fileExtension: '.ss'
	}),
	secret: 'sAjcU28AhcpolHmAj13szz',
	// cookie: {
	// 	maxAge: 14400000
	// },
	name: 'guid'
}));

// main endpoint
app.use('/api', api);

// default endpoint
app.use('/', (req, res) => {
	res.end('ok');
});

app.listen(port, () => console.log(`App listening on port ${port}!`));