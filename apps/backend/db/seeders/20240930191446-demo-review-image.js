/** @type {import('sequelize-cli').Migration} */

const { ReviewImage } = require('../models');

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

		await ReviewImage.bulkCreate(
			[
				{
					reviewId: 1,
					url: 'https://via.placeholder.com/150',
				},
				{
					reviewId: 1,
					url: 'https://via.placeholder.com/150',
				},
				{
					reviewId: 2,
					url: 'https://via.placeholder.com/150',
				},
				{
					reviewId: 3,
					url: 'https://via.placeholder.com/150',
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
		options.tableName = 'ReviewImages';
		const Op = Sequelize.Op;
		return await queryInterface.bulkDelete(
			options,
			{
				url: {
					[Op.in]: [
						'https://via.placeholder.com/150',
						'https://via.placeholder.com/150',
						'https://via.placeholder.com/150',
						'https://via.placeholder.com/150',
					],
				},
			},
			{},
		);
	},
};
