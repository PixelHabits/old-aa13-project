const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize');
const process = require('node:process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../config/database.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
	sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
	sequelize = new Sequelize(
		config.database,
		config.username,
		config.password,
		config,
	);
}

for (const file of fs.readdirSync(__dirname).filter((file) => {
	return (
		file.indexOf('.') !== 0 &&
		file !== basename &&
		file.slice(-3) === '.js' &&
		file.indexOf('.test.js') === -1
	);
})) {
	const model = require(path.join(__dirname, file))(
		sequelize,
		Sequelize.DataTypes,
	);
	db[model.name] = model;
}

for (const modelName of Object.keys(db)) {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
