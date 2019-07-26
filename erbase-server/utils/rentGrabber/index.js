const needle = require('needle');
const cheerio = require('cheerio');
const fs = require('fs');
const db = require('../db');

class rentGrabber {
	constructor () {
		this.SITE_URL = 'https://m.avito.ru';

		this.check();
		this.start();
	}

	httpOptions (sitePath) {
		return {
			headers:{
				"host": "m.avito.ru",
				"method": "GET",
				"path": sitePath,
				"scheme": "https",
				"version": "HTTP/1.1",
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
				"accept-language": "ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4",
				"cache-control": "max-age=0",
				"upgrade-insecure-requests": "1",
				"user-agent": "User-Agent: Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36"
			}
		};
	};

	insertAd (ad) {
		return new Promise((resolved, rejected) => {
			db.query('SELECT * FROM ads WHERE advertId=?', ad.id)
			.then(out => {
				if(out.length == 0) {
					let options = this.httpOptions(ad.uri_mweb);

					needle.get(this.SITE_URL + ad.uri_mweb, options, (error, response) => {
					 	if (!error && response.statusCode == 200) {
							const $ = cheerio.load(response.body);
							const href = $('a[data-marker="item-contact-bar/call"]').attr('href');

							if(href) {
								ad.phone = href.replace('tel:', '');

								return db.query('INSERT INTO ads SET creationDate=?, advertId=?, link=?, price=?, address=?, title=?, phone=?', [new Date(ad.time * 1000), ad.id, ad.uri_mweb, parseFloat(ad.price.replace(/\s+/g, '')), ad.address, ad.title, ad.phone])
								.then(out => {
									resolved(out);
								})
								.catch(error => {
									rejected({ type: 'db2', value: error });
								});
							}
							else {
								rejected({ type: 'needle', value: error });
							}
						}
					});
				}
			})
			.catch((error) => {
				rejected({ type: 'db1', value: error });
			});
		});
	}

	check () {
		this.find('/api/9/items?key=af0deccbgcgidddjgnvljitntccdduijhdinfgjgfjir&owner[]=private&sort=date&withImagesOnly=false&locationId=660680&categoryId=24&params[201]=1059&page=1&display=list&limit=30');
	}

	find (sitePath) {
		let url = this.SITE_URL + sitePath;
		
		needle.get(url, this.httpOptions(sitePath), (error, res) => {
		    if (!error) {
			    let body = res.body, list = [], itemsCount = 0, doneItemsCounter = 0;

				if(body.result && body.result.items) {
			   		let items = body.result.items;

			   		itemsCount = items.filter(item => item.type == 'item').length;

			   		for(let i=0; i<items.length; i++) {
			   			if(items[i].type == 'item') {
			   				let ad = items[i].value;

			    			this.insertAd(ad)
			    			.then(state => {
			    				if(state) {
			    					list.push(ad.uri_mweb);
			    				}

			    				doneItemsCounter++;

			    				if(doneItemsCounter == itemsCount) {
			    					callback(sms_name, list, SITE_URL);
			    				}
			    			})
			    			.catch(error => {
			    				console.log(error);
			    			});
			   			}
			   		}
			   	}
			}
		});
	}

	start () {
		this._interval = setInterval(this.check.bind(this), 60000*3);
	}

	stop () {
		if(this._interval) {
			clearInterval(this._interval);
		}
	}
}

module.exports = new rentGrabber();