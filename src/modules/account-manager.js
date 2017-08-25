
// // var crypto 		= require('crypto');
// // var MongoDB 	= require('mongodb').Db;
// // var Server 		= require('mongodb').Server;
// // var moment 		= require('moment');

// // /*
// // 	ESTABLISH DATABASE CONNECTION
// // */

// // var dbName = process.env.DB_NAME || 'node-login';
// // var dbHost = process.env.DB_HOST || 'localhost'
// // var dbPort = process.env.DB_PORT || 27017;

// var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
// db.open(function(e, d){
// 	if (e) {
// 		console.log(e);
// 	} else {
// 		if (process.env.NODE_ENV == 'live') {
// 			db.authenticate(process.env.DB_USER, process.env.DB_PASS, function(e, res) {
// 				if (e) {
// 					console.log('mongo :: error: not authenticated', e);
// 				}
// 				else {
// 					console.log('mongo :: authenticated and connected to database :: "'+dbName+'"');
// 				}
// 			});
// 		}	else{
// 			console.log('mongo :: connected to database :: "'+dbName+'"');
// 		}
// 	}
// });

// var accounts = db.collection('accounts');
const sql = require('mssql')
var config = {

	user: 'sa',

	password: 'Ditagis123',

	server: 'ditagis.com',

	database: 'BinhDuong_HeThongVienThong',



	options: {

		encrypt: false // Use this if you're on Windows Azure 

	}

}
var accounts;
sql.connect(config).then(() => {
	return sql.query`select * from account`
}).then(result => {
	accounts = result.recordset;
}).catch(err => {
	// ... error checks
})

sql.on('error', err => {
	// ... error handler
})

// var accounts = [
// 	{
// 		user: 'admin',
// 		pass: 'admin',
// 		role: 1
// 	},
// 	{
// 		user: 'doanhnghiep',
// 		pass: 'doanhnghiep',
// 		role: 2
// 	},
// ]

/* login validation methods */

exports.autoLogin = function (user, pass) {
	return accounts.find((ac) => {
		return ac.user === user && ac.pass === pass;
	})
}

exports.manualLogin = function (user, pass) {
	return accounts.find((ac) => {
		return ac.username === user && ac.password === pass;
	})
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function (newData) {
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

exports.updateAccount = function (newData) {
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

exports.updatePassword = function (email, newPass) {
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

exports.deleteAccount = function (id) {
	accounts.remove({ _id: getObjectId(id) });
}

exports.getAccountByEmail = function (email) {
	accounts.findOne({ email: email }, function (e, o) { callback(o); });
}

exports.validateResetLink = function (email, passHash) {
	accounts.find({ $and: [{ email: email, pass: passHash }] }, function (e, o) {
		callback(o ? 'ok' : null);
	});
}

exports.getAllRecords = function (callback) {
	accounts.find().toArray(
		function (e, res) {
			if (e) callback(e)
			else callback(null, res)
		});
}

exports.delAllRecords = function (callback) {
	accounts.remove({}); // reset accounts collection for testing //
}

/* private encryption & validation methods */

var generateSalt = function () {
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function (str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function (pass) {
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function (plainPass, hashedPass) {
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

var getObjectId = function (id) {
	return new require('mongodb').ObjectID(id);
}

var findById = function (id) {
	accounts.findOne({ _id: getObjectId(id) },
		function (e, res) {
			if (e) callback(e)
			else callback(null, res)
		});
}

var findByMultipleFields = function (a) {
	// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find({ $or: a }).toArray(
		function (e, results) {
			if (e) callback(e)
			else callback(null, results)
		});
}
