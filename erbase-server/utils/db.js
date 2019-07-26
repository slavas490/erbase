const mysql = require('mysql');

class DB {
	constructor () {
		this.connection = null;

		this.connect();

		this.checkConnection();
	}

	async connect () {
		return new Promise((resolved, rejected) => {
			try {
				this.close();

				this.connection = mysql.createConnection({
					host     : '2.59.42.51',
					user     : 'root',
					password : 'QwDAgjQ381Hfd',
					database : 'erbase',
					supportBigNumbers: true
				});

				this.connection.connect(error => {
					if(error) {
						rejected(error);
					}
					else {
						resolved(true);
					}
				});
			}
			catch (error) {
				rejected(error);
			}
		})
	}

	checkConnection () {
		setInterval(async () => {
			if(this.connection) {
				while(!(this.connection.state == 'authenticated' || this.connection.state == 'connected')) {
					console.log(new Date(), 'reconnecting');

					let connection = await this.connect();
				}
			}
		}, 200);
	}

	close () {
		try {
			this.connection.end();
		}
		catch (error) {}
	}

	query (query, params) {
		return new Promise((resolved, rejected) => {
			this.connection.query(query, params, (error, results, fields) => {
				if (error) {
					rejected(error);
				}
				else {
					resolved(results, fields);
				}
			});
		})
	}

	queryOne (query, params) {
		return this.query(query, params)
		.then(out => {
			if(out && out.length) {
				return out[0];
			}
			else {
				return null;
			}
		});
	}

	/***** USER *****/
	userAuthenticate (phone, password) {
		return this.queryOne('SELECT * FROM user WHERE phone=? AND password=?', [phone, password]);
	}

	createUser (data) {
		return this.query('INSERT INTO user SET name=?, password=?, phone=?, email=?, agency=?, specialize=?, phoneChief=?, private=?', [data.name, data.password, data.phone, data.email, data.agency, data.specialize, data.phoneChief, data.private]);
	}

	confirmUser (id) {
		return this.query('UPDATE user SET isEmailConfirm=1 WHERE id=?', id);
	}

	updateUser (userId, id, data) {
		return this.queryOne('SELECT isAdmin FROM user WHERE id=?', userId)
		.then(out => {
			if(out.isAdmin == 1) {
				return this.query('UPDATE user SET name=?, agencyTitle=?, customLogo=?, designColor=?, isActive=?, private=?, phone=?, phoneChief=?, email=?, agency=?, agencyId=?, specialize=? WHERE id=?', [data.name, data.agencyTitle, data.customLogo, data.designColor, data.isActive, data.private, data.phone, data.phoneChief, data.email, data.agency, data.agencyId, data.specialize, id]);
			}
		});
	}

	updateUserInfo (userId, data) {
		return this.query('UPDATE user SET agency=?, email=?, hasCar=?, name=?, phone=?, phoneChief=?, private=?, specialize=? WHERE id=?', [data.agency, data.email, data.hasCar, data.name, data.phone, data.phoneChief, data.private, data.specialize, userId]);
	}

	updateUserPassword (userId, data) {
		return this.query('UPDATE user SET password=? WHERE id=?', [data.password, userId]);
	}

	updateUserPasswordByEmail (email, password) {
		return this.query('UPDATE user SET password=? WHERE email LIKE ? LIMIT 1', [password, email]);
	}

	getUser (id, additionalFields = []) {
		return this.queryOne('SELECT ' + (additionalFields.length ? additionalFields.join(', ') + ', ' : '') + ' id, name, creationDate, agencyTitle, customLogo, designColor, isBlocked, isAdmin, isActive, private, phone, phoneChief, email, agency, agencyId, hasCar, specialize FROM user WHERE id=?', id);
	}

	getUsers (realtorId) {
		return this.queryOne('SELECT isAdmin FROM user WHERE id=?', realtorId)
		.then(out => {
			return this.query('SELECT id, name, creationDate, agencyTitle, customLogo, designColor, isBlocked, isAdmin, isActive, private, phone, phoneChief, email, agency, agencyId, hasCar, specialize FROM user WHERE id!=? ' + (out.isAdmin != 1 ? 'AND isBlocked=0' : '') + ' ORDER BY id DESC', realtorId);
		});
	}

	blockUser (userId, id, status) {
		return this.queryOne('SELECT isAdmin FROM user WHERE id=?', userId)
		.then(out => {
			if(out.isAdmin == 1) {
				return this.query('UPDATE user SET isBlocked=? WHERE id=?', [status, id]);
			}
		});
	}

	removeUserLogo (userId, id) {
		return this.queryOne('SELECT isAdmin FROM user WHERE id=?', userId)
		.then(out => {
			if(out.isAdmin == 1) {
				return this.query('UPDATE user SET customLogo=0 WHERE id=?', id);
			}
		});
	}

	checkUserForActive (id) {
		return this.queryOne('SELECT isActive FROM user WHERE id=?', id);
	}

	/***** ADS *****/
	getAds (realtorId) {
		return this.query('SELECT *, (SELECT COUNT(*) FROM realtorAds WHERE _ads.id=realtorAds.adId AND realtorAds.realtorId=?) as isActive, (SELECT comment FROM realtorAds WHERE _ads.id=realtorAds.adId AND realtorAds.realtorId=?) as comment, (SELECT COUNT(id) FROM ads WHERE _ads.phone LIKE ads.phone) > 1 as isRealtor FROM ads _ads WHERE deleted=0 ORDER BY id DESC', [realtorId, realtorId]);
	}

	setActiveAd (realtorId, id) {
		return this.query('INSERT INTO realtorAds SET adId=?, realtorId=?', [id, realtorId]);
	}

	removeActiveAd (realtorId, id) {
		return this.query('DELETE FROM realtorAds WHERE adId=? AND realtorId=?', [id, realtorId]);
	}

	removeAd (id) {
		return this.query('UPDATE ads SET deleted=1 WHERE id=?', id)
		.then(out => {
			return this.query('DELETE FROM realtorAds WHERE adId=?', id);
		});
	}

	updateAdComment (realtorId, adId, comment) {
		return this.query('UPDATE realtorAds SET comment=? WHERE realtorId=? AND adId=?', [comment, realtorId, adId]);
	}

	/***** SELLERS *****/
	createSeller (data) {
		return this.query('INSERT INTO seller SET type=?, name=?, isStudio=?, phoneNumber=?, email=?, rooms=?, repairs=?, district=?, street=?, houseNumber=?, floor=?, floorsCount=?, builtYear=?, info=?, cost=?, square=?, flatNumber=?, realtor=?, priceM2=?', [data.type, data.userName, data.isStudio, data.phoneNumber, data.email, data.rooms, data.repairs, data.district, data.street, data.houseNumber, data.floor, data.floorsCount, data.builtYear, data.info, data.cost, data.square, data.flatNumber, data.realtor, data.priceM2]);
	}

	createSellerImage (sellerId, type) {
		return this.query('INSERT INTO sellerImage SET seller=?, type=?', [sellerId, type]);
	}

	removeSellerImage (realtorId, id) {
		let sellerId = 0;

		return this.queryOne('SELECT seller.id, seller.realtor FROM seller JOIN sellerImage ON sellerImage.seller=seller.id WHERE sellerImage.id=?', id)
		.then(out => {
			if(out.realtor == realtorId) {
				sellerId = out.id;
				return this.query('DELETE FROM sellerImage WHERE id=?', id);
			}
			else {
				throw 'Wrong image id';
			}
		})
		.then(out => {
			if(out.affectedRows > 0) {
				return { id, sellerId, realtorId };
			}
			else {
				throw 'Nothing affected';
			}
		});
	}

	updateSeller (data) {
		if(data.combineId) {
			return this.queryOne('SELECT isAdmin FROM user WHERE id=?', data.realtor)
			.then(user => {
				if(user.isAdmin) {
					return this.queryOne('SELECT * FROM seller WHERE id=?', data.combineId);
				}
				else {
					throw 'User is not admin';
				}
			})
			.then(copyFrom => {
				if(copyFrom) {
					return this.query('UPDATE seller SET deleted=?, updateDate=?, type=?, name=?, isStudio=?, phoneNumber=?, email=?, rooms=?, repairs=?, district=?, street=?, houseNumber=?, floor=?, floorsCount=?, builtYear=?, info=?, cost=?, square=?, flatNumber=?, priceM2=?, revisionComment=NULL WHERE id=? AND realtor=?', [data.deleted, new Date(), copyFrom.type, data.userName, data.isStudio, data.phoneNumber, data.email, copyFrom.rooms, data.repairs, copyFrom.district, copyFrom.street, copyFrom.houseNumber, copyFrom.floor, copyFrom.floorsCount, data.builtYear, data.info, data.cost, copyFrom.square, copyFrom.flatNumber, data.priceM2, data.id, data.realtor]);
				}
				else {
					throw 'Wrong seller id';
				}
			})
		}
		else {
			return this.query('UPDATE seller SET deleted=?, updateDate=?, type=?, name=?, isStudio=?, phoneNumber=?, email=?, rooms=?, repairs=?, district=?, street=?, houseNumber=?, floor=?, floorsCount=?, builtYear=?, info=?, cost=?, square=?, flatNumber=?, priceM2=?, revisionComment=NULL WHERE id=? AND realtor=?', [data.deleted, new Date(), data.type, data.userName, data.isStudio, data.phoneNumber, data.email, data.rooms, data.repairs, data.district, data.street, data.houseNumber, data.floor, data.floorsCount, data.builtYear, data.info, data.cost, data.square, data.flatNumber, data.priceM2, data.id, data.realtor]);
		}
	}

	confirmSeller (userId, id) {
		return this.queryOne('SELECT isAdmin FROM user WHERE id=?', userId)
		.then(user => {
			if(user.isAdmin) {
				return this.query('UPDATE seller SET isChecked=1, revisionComment=NULL WHERE id=?', id);
			}
			else {
				throw 'User is not admin';
			}
		});
	}

	revisionSeller (userId, id, data) {
		return this.queryOne('SELECT isAdmin FROM user WHERE id=?', userId)
		.then(user => {
			if(user.isAdmin) {
				return this.query('UPDATE seller SET isChecked=0, revisionComment=? WHERE id=?', [data, id]);
			}
			else {
				throw 'User is not admin';
			}
		});
	}

	cancelSeller (userId, id) {
		return this.queryOne('SELECT isAdmin FROM user WHERE id=?', userId)
		.then(user => {
			if(user.isAdmin) {
				return this.query('UPDATE seller SET isChecked=0, revisionComment=NULL WHERE id=?', id);
			}
			else {
				throw 'User is not admin';
			}
		});
	}

	removeSeller (realtorId, id, isCompletelyRemove) {
		return this.queryOne('SELECT isAdmin FROM user WHERE id=?', realtorId)
		.then(user => {
			if(user.isAdmin) {
				if(isCompletelyRemove) {
					return this.query('DELETE FROM seller WHERE id=?', id);
				}
				else {
					return this.query('UPDATE seller SET deleted=1, deletedTime=? WHERE id=?', [new Date(), id]);
				}
			}
			else {
				return this.query('UPDATE seller SET deleted=1, deletedTime=? WHERE id=? AND realtor=?', [new Date(), id, realtorId]);
			}
		});
	}

	restoreSeller (realtorId, id) {
		return this.query('UPDATE seller SET deleted=0, deletedTime=NULL WHERE id=? AND realtor=?', [id, realtorId]);
	}

	getSellers () {
		return this.query('SELECT seller.*, realtor.name as realtorName, realtor.agency as realtorAgency, realtor.agencyId as realtorAgencyId, realtor.phone as realtorPhone, realtor.email as realtorEmail, realtor.private as realtorPrivate, realtor.phoneChief as realtorPhoneChief, (SELECT GROUP_CONCAT(sellerImage.id SEPARATOR ",") FROM sellerImage WHERE sellerImage.seller=seller.id AND type="photo") as photoArray, (SELECT GROUP_CONCAT(sellerImage.id SEPARATOR ",") FROM sellerImage WHERE sellerImage.seller=seller.id AND type="layout") as layoutArray, (SELECT COUNT(id) FROM sellerImage WHERE sellerImage.seller=seller.id AND type="photo") as photosCount, (SELECT COUNT(id) FROM sellerImage WHERE sellerImage.seller=seller.id AND type="layout") as layoutsCount, (SELECT deletedType FROM deals WHERE deals.sellerId=seller.id ORDER BY id DESC LIMIT 1) as deletedType, (SELECT deletedInfo FROM deals WHERE deals.sellerId=seller.id ORDER BY id DESC LIMIT 1) as deletedInfo FROM seller JOIN user realtor ON realtor.id = seller.realtor ORDER BY seller.id DESC');
	}

	getSellerById (id) {
		return this.queryOne('SELECT seller.*, realtor.name as realtorName, realtor.agency as realtorAgency, realtor.agencyId as realtorAgencyId, realtor.phone as realtorPhone, realtor.email as realtorEmail, realtor.private as realtorPrivate, realtor.phoneChief as realtorPhoneChief, (SELECT GROUP_CONCAT(sellerImage.id SEPARATOR ",") FROM sellerImage WHERE sellerImage.seller=seller.id AND type="photo") as photoArray, (SELECT GROUP_CONCAT(sellerImage.id SEPARATOR ",") FROM sellerImage WHERE sellerImage.seller=seller.id AND type="layout") as layoutArray, (SELECT COUNT(id) FROM sellerImage WHERE sellerImage.seller=seller.id AND type="photo") as photosCount, (SELECT COUNT(id) FROM sellerImage WHERE sellerImage.seller=seller.id AND type="layout") as layoutsCount, (SELECT deletedType FROM deals WHERE deals.sellerId=seller.id ORDER BY id DESC LIMIT 1) as deletedType, (SELECT deletedInfo FROM deals WHERE deals.sellerId=seller.id ORDER BY id DESC LIMIT 1) as deletedInfo FROM seller JOIN user realtor ON realtor.id = seller.realtor WHERE seller.id=? ORDER BY seller.id DESC', id);
	}

	/***** BUYERS *****/
	createBuyer (data) {
		return this.query('INSERT INTO buyer SET type=?, email=?, phoneNumber=?, name=?, district=?, realtor=?, street=?, costFrom=?, costTo=?, floorFrom=?, floorTo=?, houseNumber=?, rooms=?, square=?, info=?', [data.type, data.email, data.phoneNumber, data.userName, data.district, data.realtor, data.street, data.costFrom, data.costTo, data.floorFrom, data.floorTo, data.houseNumber, data.rooms, data.square, data.info]);
	}

	updateBuyer (realtorId, data) {
		return this.query('UPDATE buyer SET deleted=?, updateDate=?, type=?, email=?, phoneNumber=?, name=?, district=?, street=?, costFrom=?, costTo=?, floorFrom=?, floorTo=?, houseNumber=?, rooms=?, square=?, info=? WHERE id=? AND realtor=?', [data.deleted, new Date(), data.type, data.email, data.phoneNumber, data.userName, data.district, data.street, data.costFrom, data.costTo, data.floorFrom, data.floorTo, data.houseNumber, data.rooms, data.square, data.info, data.id, realtorId]);
	}

	removeBuyer (realtorId, id, isCompletelyRemove) {
		return this.queryOne('SELECT isAdmin FROM user WHERE id=?', realtorId)
		.then(user => {
			if(user.isAdmin && isCompletelyRemove) {
				return this.query('DELETE FROM buyer WHERE id=?', id);
			}
			else {
				return this.query('UPDATE buyer SET deleted=1, deletedTime=? WHERE id=? AND realtor=?', [new Date(), id, realtorId]);
			}
		});
	}

	restoreBuyer (realtorId, id) {
		return this.query('UPDATE buyer SET deleted=0, deletedTime=NULL WHERE id=? AND realtor=?', [id, realtorId]);
	}

	getBuyers () {
		return this.query('SELECT buyer.*, realtor.name as realtorName, realtor.agency as realtorAgency, realtor.agencyId as realtorAgencyId, realtor.phone as realtorPhone, realtor.private as realtorPrivate, realtor.phoneChief as realtorPhoneChief, (SELECT deletedType FROM deals WHERE deals.buyerId=buyer.id ORDER BY id DESC LIMIT 1) as deletedType, (SELECT deletedInfo FROM deals WHERE deals.buyerId=buyer.id ORDER BY id DESC LIMIT 1) as deletedInfo FROM buyer JOIN user realtor ON realtor.id = buyer.realtor ORDER BY buyer.id DESC');
	}

	getBuyerById (id) {
		return this.queryOne('SELECT buyer.*, realtor.name as realtorName, realtor.agency as realtorAgency, realtor.agencyId as realtorAgencyId, realtor.phone as realtorPhone, realtor.private as realtorPrivate, realtor.phoneChief as realtorPhoneChief, (SELECT deletedType FROM deals WHERE deals.buyerId=buyer.id ORDER BY id DESC LIMIT 1) as deletedType, (SELECT deletedInfo FROM deals WHERE deals.buyerId=buyer.id ORDER BY id DESC LIMIT 1) as deletedInfo FROM buyer JOIN user realtor ON realtor.id = buyer.realtor WHERE buyer.id=? ORDER BY buyer.id DESC', id);
	}

	/***** DEALS *****/
	createDeal (data) {
		if(data.type == 'new') {
			return this.query('INSERT INTO deals SET realtor=?, type=?, price=?, buyerId=?, sellerName=?, bank=?, reserved=?', [data.realtor, data.type, data.price, data.buyerId, data.sellerName, data.bank, data.reserved]);
		}
		else if(data.type == 'secondary') {
			return this.query('INSERT INTO deals SET realtor=?, type=?, price=?, buyerId=?, sellerId=?, bank=?, reserved=?', [data.realtor, data.type, data.price, data.buyerId, data.sellerId, data.bank, data.reserved]);	
		}
	}

	updateDeal (realtorId, data) {
		if(data.type == 'new') {
			return this.query('UPDATE deals SET updateDate=?, type=?, price=?, buyerId=?, sellerName=?, bank=?, reserved=? WHERE id=? AND realtor=?', [new Date(), data.type, data.price, data.buyerId, data.sellerName, data.bank, data.reserved, data.id, realtorId]);
		}
		else if(data.type == 'secondary') {
			return this.query('UPDATE deals SET updateDate=?, type=?, price=?, buyerId=?, sellerId=?, bank=?, reserved=? WHERE id=? AND realtor=?', [new Date(), data.type, data.price, data.buyerId, data.sellerId, data.bank, data.reserved, data.id, realtorId]);
		}
	}

	deleteDeal (realtorId, id, data) {
		return this.queryOne('SELECT * FROM deals WHERE id=? AND realtor=?', [id, realtorId])
		.then(async (deal) => {

			if(deal.sellerId > 0) {
				await this.query('UPDATE seller SET deleted=1, deletedTime=? WHERE id=?', [new Date(), deal.sellerId]);
			}

			if(deal.buyerId > 0) {
				await this.query('UPDATE buyer SET deleted=1, deletedTime=? WHERE id=?', [new Date(), deal.buyerId]);
			}

			return this.query('UPDATE deals SET deleted=1, deletedType=?, deletedTime=?, deletedInfo=? WHERE id=? AND realtor=?', [data.type, new Date(), data.text, id, realtorId]);
		});
	}

	getDeals (realtorId) {
		return this.query('SELECT *, (CASE WHEN type LIKE "secondary" THEN (SELECT CONCAT(street, ", ", houseNumber) FROM seller WHERE seller.id=deals.sellerId) WHEN type LIKE "new" THEN deals.sellerName END) as objectName FROM deals WHERE realtor=? ORDER BY id DESC', realtorId);
	}

	changeDealStatus (userId, id, name, status) {
		let cells = ['reserved', 'appreciated', 'saleContract', 'certificates', 'bankApproval', 'securityService', 'admissionToDeal', 'signed', 'paid', 'apartmentPassed', 'fedsfm'];

		if(cells.indexOf(name) != -1) {
			return this.query('UPDATE deals SET updateDate=?, ' + name + '=? WHERE id=? AND realtor=?', [new Date(), parseInt(status), parseInt(id), userId]);
		}
		else {
			throw 'Wrong cell name';
		}
	}

	/***** NOTES *****/
	getNotes (realtorId) {
		return this.query('SELECT * FROM notes WHERE realtorId=?', realtorId);
	}

	createNote (realtorId, data) {
		return this.query('INSERT INTO notes SET realtorId=?, value=?', [realtorId, data]);
	}

	editNote (realtorId, id, data) {
		return this.query('UPDATE notes SET value=? WHERE realtorId=? AND id=?', [data, realtorId, id]);
	}

	removeNote (realtorId, id) {
		return this.query('DELETE FROM notes WHERE realtorId=? AND id=?', [realtorId, id]);
	}

	/***** GEO *****/
	searchStreetByName (name, limit) {
		return this.query('SELECT * FROM street WHERE title LIKE ? ORDER BY title ASC LIMIT 0, ?', ['%' + name + '%', limit]);
	}
}

module.exports = new DB();