const config = {
	user: 'sa',
	password: '268@lTk',
	server: '112.78.4.175',
	database: 'BaoVeThucVat',
}
class AccountManager {
	constructor(params) {
		this.sql = require('mssql')
	}
	close(){
		this.sql.close();
	}
	autoLogin(user, pass) {
		return new Promise((resolve, reject) => {
			this.sql.connect(config).then(() => {
				return this.sql.query`SELECT * FROM ACCOUNT WHERE USERNAME = ${user} AND PASSWORD = ${pass}`;
			}).then(result => {
				if (result.recordset.length > 0)
					resolve(result.recordset[0])
				else resolve(null);
				this.sql.close();
			}).catch(err => {
				console.log(err);
				this.sql.close();
			})
		});
	}

	manualLogin(user, pass) {
		return this.autoLogin(user, pass);
	}


	/* record insertion, update & deletion methods */

	addNewAccount(newData) {
		// accounts.findOne({ user: newData.user }, function (e, o) {
		// 	if (o) {
		// 		callback('username-taken');
		// 	} else {
		// 		accounts.findOne({ email: newData.email }, function (e, o) {
		// 			if (o) {
		// 				callback('email-taken');
		// 			} else {
		// 				saltAndHash(newData.pass, function (hash) {
		// 					newData.pass = hash;
		// 					// append date stamp when record was created //
		// 					newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		// 					accounts.insert(newData, { safe: true });
		// 				});
		// 			}
		// 		});
		// 	}
		// });
	}

	updateAccount(newData) {
		// accounts.findOne({ _id: getObjectId(newData.id) }, function (e, o) {
		// 	o.name = newData.name;
		// 	o.email = newData.email;
		// 	o.country = newData.country;
		// 	if (newData.pass == '') {
		// 		accounts.save(o, { safe: true }, function (e) {
		// 			if (e) callback(e);
		// 			else callback(null, o);
		// 		});
		// 	} else {
		// 		saltAndHash(newData.pass, function (hash) {
		// 			o.pass = hash;
		// 			accounts.save(o, { safe: true }, function (e) {
		// 				if (e) callback(e);
		// 				else callback(null, o);
		// 			});
		// 		});
		// 	}
		// });
	}

	updatePassword(email, newPass) {
		// accounts.findOne({ email: email }, function (e, o) {
		// 	if (e) {
		// 		callback(e, null);
		// 	} else {
		// 		saltAndHash(newPass, function (hash) {
		// 			o.pass = hash;
		// 			accounts.save(o, { safe: true });
		// 		});
		// 	}
		// });
	}

	/* account lookup methods */

	deleteAccount(id) {
		accounts.remove({ _id: getObjectId(id) });
	}

	getAccountByEmail(email) {
		accounts.findOne({ email: email }, function (e, o) { callback(o); });
	}

	validateResetLink(email, passHash) {
		accounts.find({ $and: [{ email: email, pass: passHash }] }, function (e, o) {
			callback(o ? 'ok' : null);
		});
	}

	getAllRecords(callback) {
		accounts.find().toArray(
			function (e, res) {
				if (e) callback(e)
				else callback(null, res)
			});
	}

	delAllRecords(callback) {
		accounts.remove({}); // reset accounts collection for testing //
	}

	/* private encryption & validation methods */

	generateSalt() {
		var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
		var salt = '';
		for (var i = 0; i < 10; i++) {
			var p = Math.floor(Math.random() * set.length);
			salt += set[p];
		}
		return salt;
	}

	md5(str) {
		return crypto.createHash('md5').update(str).digest('hex');
	}

	saltAndHash(pass) {
		var salt = generateSalt();
		callback(salt + md5(pass + salt));
	}

	validatePassword(plainPass, hashedPass) {
		var salt = hashedPass.substr(0, 10);
		var validHash = salt + md5(plainPass + salt);
		callback(null, hashedPass === validHash);
	}

	getObjectId(id) {
		return new require('mongodb').ObjectID(id);
	}

	findById(id) {
		accounts.findOne({ _id: getObjectId(id) },
			function (e, res) {
				if (e) callback(e)
				else callback(null, res)
			});
	}

	findByMultipleFields(a) {
		// this takes an array of name/val pairs to search against {fieldName : 'value'} //
		accounts.find({ $or: a }).toArray(
			function (e, results) {
				if (e) callback(e)
				else callback(null, results)
			});
	}
}
module.exports = AccountManager