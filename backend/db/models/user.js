'use strict';
const { Model, Validator } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	User.init(
		{
			firstName: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notNull: {
						msg: 'Please enter your first name',
					},
					isAlpha: true,
					len: [1, 30],
				},
			},
			lastName: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notNull: {
						msg: 'Please enter your last name',
					},
					isAlpha: true,
					len: [1, 30],
				},
			},
			username: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					notNull: {
						msg: 'Please enter a username',
					},
					len: [4, 30],
					isNotEmail(value) {
						if (Validator.isEmail(value)) {
							throw new Error('Cannot be an email.');
						}
					},
				},
			},
			hashedPassword: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					len: [60, 60],
				},
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notNull: {
						msg: 'Please enter your email address',
					},
					len: [3, 256],
					isEmail: true,
				},
			},
		},
		{
			sequelize,
			modelName: 'User',
			defaultScope: {
				attributes: {
					exclude: [
						'firstName',
						'lastName',
						'hashedPassword',
						'email',
						'createdAt',
						'updatedAt',
					],
				},
			},
		}
	);
	return User;
};
