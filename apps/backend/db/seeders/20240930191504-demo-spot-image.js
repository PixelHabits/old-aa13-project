/** @type {import('sequelize-cli').Migration} */

const { SpotImage } = require('../models');

const options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = {
	async up(queryInterface, Sequelize) {
		/**
		 * Add seed commands here.
		 *
		 * Example:
		 * await queryInterface.bulkInsert('People', [{
		 *   name: 'John Doe',
		 *   isBetaMember: false
		 * }], {});
		 */
		await SpotImage.bulkCreate(
			[
				{
					spotId: 1,
					url: 'https://via.placeholder.com/150',
					preview: true,
				},
				{
					spotId: 1,
					url: 'https://via.placeholder.com/150',
					preview: false,
				},
				{
					spotId: 2,
					url: 'https://via.placeholder.com/150',
					preview: true,
				},
				{
					spotId: 3,
					url: 'https://via.placeholder.com/150',
					preview: true,
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
		options.tableName = 'SpotImages';
		const Op = Sequelize.Op;
		return await queryInterface.bulkDelete(
			options,
			{
				url: {
					[Op.in]: [
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
