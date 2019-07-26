const db = require('../../utils/db');
const fs = require('fs');
const path = require('path');
const HTML = {};

const RepairType = [
	{
		id: 1,
		name: 'Косметический'
	},
	{
		id: 2,
		name: 'Современный'
	},
	{
		id: 3,
		name: 'Черновая отделка'
	},
	{
		id: 4,
		name: 'Предчистовая отделка'
	}
];

// load html parts on the mail
try {
	const pieces = ['header', 'footer', 'sellerId', 'sellerCharacteristic', 'sellerPhotoCell', 'sellerPhotosContainer'];

	for(let i in pieces) {
		HTML[pieces[i]] = fs.readFileSync(path.join(__dirname, 'SellerMailing', pieces[i])).toString();
	}
}
catch (ex) {
	console.error(ex);
}

class Mailing {
	constructor () {
	}

	async setIds (ids) {
		let sellers = await db.getSellers();

		sellers = sellers.filter(item => ids.indexOf(item.id + '') !== -1);

		this.sellers = sellers;
	}

	async setRealtorId (id) {
		let realtor = await db.getUser(id);
		this.realtor = realtor;
	}

	getRealtor () {
		return this.realtor;
	}

	createHTML () {
		if (!this.sellers) {
			throw new Error('sellers ids not defined!');
		}

		let realtor = this.realtor;

		// realtor logo
		let realtorLogoHeader = realtor.customLogo ? 'http://erbase.ru:8080/static/designLogo/' + realtor.id + '.png' : 'http://erbase.ru/image/logo.png';
		let realtorLogoFooter = realtor.customLogo ? realtorLogoHeader : '';

		// header
		let html = HTML.header;
		html = html.replace('{{realtorLogo}}', realtorLogoHeader);

		// body
		for(let i in this.sellers) {
			let seller = this.sellers[i];

			// header of the mail
			html = html.replace('{{realtorName}}', realtor.name);
			html = html.replace('{{realtorPhone}}', realtor.phone);
			html = html.replace('{{realtorEmail}}', realtor.email);

			// body
			let sellerIdHTML = HTML.sellerId;
			sellerIdHTML = sellerIdHTML.replace('{{sellerId}}', seller.id);
			sellerIdHTML = sellerIdHTML.replace('{{sellerAddress}}', seller.street + ', ' + seller.houseNumber);
			html += sellerIdHTML;

			let sellerParamsHTML = HTML.sellerCharacteristic;
			sellerParamsHTML = sellerParamsHTML.replace('{{rooms}}', (seller.isStudio ? 'Студия' + (seller.rooms > 0 ? '+' + seller.rooms + 'к' : '') : seller.rooms + 'к'));
			sellerParamsHTML = sellerParamsHTML.replace('{{square}}', seller.square);
			sellerParamsHTML = sellerParamsHTML.replace('{{floor}}', seller.floor + '/' + seller.floorsCount);
			sellerParamsHTML = sellerParamsHTML.replace('{{builtYear}}', seller.builtYear);
			sellerParamsHTML = sellerParamsHTML.replace('{{repairs}}', this.getRepairType(seller.repairs));
			sellerParamsHTML = sellerParamsHTML.replace('{{info}}', seller.info);
			sellerParamsHTML = sellerParamsHTML.replace('{{cost}}', (seller.cost * 1000).toLocaleString('ru'));
			sellerParamsHTML = sellerParamsHTML.replace('{{priceM2}}', (seller.priceM2 * 1000).toLocaleString('ru'));
			html += sellerParamsHTML;

			const apartmentPhotos = seller.photoArray ?
				seller.photoArray.split(',').map(item => 'http://' + this.getAPIUrl() + '/static/photo/' + seller.id + '_' + item + '.png')
				: [];

			let photos = ''; 
			for(let j=0; j<apartmentPhotos.length; j++) {
				let url = apartmentPhotos[j];
				photos += HTML.sellerPhotoCell.replace('{{url}}', url).replace('{{href}}', url);

				if(j % 4 === 3 || j === apartmentPhotos.length - 1) {
					let container = HTML.sellerPhotosContainer;
					container = container.replace('{{cell}}', photos);
					html += container;
					photos = '';
				}
			}
		}

		// footer
		html += HTML.footer.replace('{{realtorLogo}}', realtorLogoFooter).replace('{{agency}}', realtor.agency);

		return html;
	}

	getRepairType (repairs) {
        let type = RepairType.find(item => item.id === repairs)
        
        if(type) {
            return type.name;
        }
        else {
            return null;
        }
    }

    getAPIUrl () {
    	return 'erbase.ru:8080'
    }
}

module.exports = Mailing;