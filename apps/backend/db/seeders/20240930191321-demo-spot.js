'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Spot } = require('../models');

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

    await Spot.bulkCreate(
      [
        {
          ownerId: 1,
          address: '1234 Fake St',
          city: 'Faketown',
          state: 'FK',
          country: 'USA',
          lat: 89.456,
          lng: 25.789,
          name: 'Fake Spot',
          description: 'This is a fake spot',
          price: 50.00,
        },
        {
          ownerId: 2,
          address: '5678 Fake St',
          city: 'Faketown',
          state: 'FK',
          country: 'USA',
          lat: 48.654,
          lng: 72.321,
          name: 'Fake Spot 2',
          description: 'This is another fake spot',
          price: 100.00,
        },
      ],
      { validate: true }
    );
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return await queryInterface.bulkDelete(
      options,
      {
        name: { [Op.in]: ['Fake Spot', 'Fake Spot 2'] },
      },
      {}
    );
	},
};
