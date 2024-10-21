// biome-ignore lint/correctness/noNodejsModules: <explanation>
import { readdirSync } from 'node:fs';
// biome-ignore lint/correctness/noNodejsModules: <explanation>
import { basename as _basename, join } from 'node:path';
import Sequelize, { DataTypes } from 'sequelize';
// biome-ignore lint/correctness/noNodejsModules: <explanation>
import { env as _env } from 'node:process';
const basename = _basename(__filename);
const env = _env.NODE_ENV || 'development';
const config = require(`${__dirname}/../../config/database.js`)[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
	sequelize = new Sequelize(_env[config.use_env_variable], config);
} else {
	sequelize = new Sequelize(
		config.database,
		config.username,
		config.password,
		config,
	);
}

for (const file of readdirSync(__dirname).filter((file) => {
	return (
		file.indexOf('.') !== 0 &&
		file !== basename &&
		file.slice(-3) === '.js' &&
		file.indexOf('.test.js') === -1
	);
})) {
	const model = require(join(__dirname, file))(
		sequelize,
		DataTypes,
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

export default db;
