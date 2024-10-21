/** @type {import('sequelize-cli').Migration} */

const { Review } = require('../models');

const options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
	async up(_queryInterface, _Sequelize) {
		/**
		 * Add seed commands here.
		 *
		 * Example:
		 * await queryInterface.bulkInsert('People', [{
		 *   name: 'John Doe',
		 *   isBetaMember: false
		 * }], {});
		 */

		await Review.bulkCreate(
			[
				{
					userId: 1,
					spotId: 1,
					stars: 5,
					review: 'This spot is great!',
				},
				{
					userId: 2,
					spotId: 1,
					stars: 4,
					review: 'This spot is pretty good!',
				},
				{
					userId: 3,
					spotId: 2,
					stars: 3,
					review: 'This spot is okay!',
				},
			],
			{ validate: true },
		);
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
		options.tableName = 'Reviews';
		const Op = Sequelize.Op;
		return await queryInterface.bulkDelete(
			options,
			{
				review: {
					[Op.in]: [
						'This spot is great!',
						'This spot is pretty good!',
						'This spot is okay!',
					],
				},
			},
			{},
		);
	},
};
