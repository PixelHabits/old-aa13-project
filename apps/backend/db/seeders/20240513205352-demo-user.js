'use strict';

/** @type {import('sequelize-cli').Migration} */

const { User } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
	async up(queryInterface, Sequelize) {
		await User.bulkCreate(
			[
				{
					firstName: 'Kenneth',
					lastName: 'Emard',
					username: 'Demo-lition',
					hashedPassword: bcrypt.hashSync('password'),
					email: 'demo@user.io',
				},
				{
					firstName: 'Moses',
					lastName: 'Smitham',
					username: 'FakeUser1',
					hashedPassword: bcrypt.hashSync('password2'),
					email: 'user1@user.io',
				},
				{
					firstName: 'Elias',
					lastName: 'Helm',
					username: 'FakeUser2',
					hashedPassword: bcrypt.hashSync('password3'),
					email: 'user2@user.io',
				},
			],
			{ validate: true }
		);
	},

	async down(queryInterface, Sequelize) {
		options.tableName = 'Users';
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(
			options,
			{
				username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] },
			},
			{}
		);
	},
};
