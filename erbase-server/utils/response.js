const express = require('express');
const app = express();

const base64 = (data) => {
	return new Buffer(data).toString('base64');
}

const encodeError = (data) => {
	if(typeof data == 'object') {
		data = JSON.stringify(data);
	}
	
	let buff = base64(data);
	let tmp = '', out = '';

	// XOR
	for(let i=0, size=buff.length; i<size; i++) {
		tmp += String.fromCharCode(buff.charCodeAt(i) ^ 103);
	}

	out = tmp;

	return base64(out);
}

app.use((req, res) => {
	res.done = (value) => {
		let obj = {
			status: 0
		};

		let responseCode = res.code || 200,
			responseCodeClass = parseInt(responseCode / 100);

		if(responseCodeClass == 4 || responseCodeClass == 5) {
			obj.status = 1;
		}

		if(res.error) {
			let error = res.error;

			obj.status = 1;

			if(typeof error == 'number') {
				obj.error = error;
			}
			else {
				obj.error = encodeError(error);
				obj.isASCIIError = true;
			}
		}
		else if(value) {
			obj.value = value;
		}

		if(responseCode) {
			res.status(responseCode);
		}
		
		res.json(obj);
	};

	req.next();
});

module.exports = app;