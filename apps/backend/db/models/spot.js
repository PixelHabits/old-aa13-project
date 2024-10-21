const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Spot extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Spot.belongsTo(models.User, { foreignKey: 'ownerId', as: 'Owner' });
			Spot.hasMany(models.SpotImage, {
				foreignKey: 'spotId',
				as: 'SpotImages',
			});
			Spot.hasMany(models.Review, { foreignKey: 'spotId', as: 'Reviews' });
		}
		static previewImageAttribute() {
			const isPostgres = sequelize.getDialect() === 'postgres';
			if (isPostgres) {
				return sequelize.literal(`(
					SELECT "images"."url"
					FROM "air_bnb"."SpotImages" AS "images"
					WHERE "images"."spotId" = "Spot"."id"
					AND "images"."preview" = true
					LIMIT 1
				)`);
			}
			// SQLite syntax
			return sequelize.literal(`(
					SELECT url
					FROM SpotImages
					WHERE spotId = Spot.id
					AND preview = 1
					LIMIT 1
				)`);
		}

		static avgRatingAttribute() {
			const isPostgres = sequelize.getDialect() === 'postgres';
			if (isPostgres) {
				return sequelize.literal(`(
					SELECT AVG("reviews"."stars")
					FROM "air_bnb"."Reviews" AS "reviews"
					WHERE "reviews"."spotId" = "Spot"."id"
				)`);
			}
			// SQLite syntax
			return sequelize.literal(`(
				SELECT AVG(reviews.stars)
				FROM Reviews AS reviews
				WHERE reviews.spotId = Spot.id
			)`);
		}

		static numReviewsAttribute() {
			const isPostgres = sequelize.getDialect() === 'postgres';
			if (isPostgres) {
				return sequelize.literal(`(
					SELECT COUNT(*)
					FROM "air_bnb"."Reviews" AS "reviews"
					WHERE "reviews"."spotId" = "Spot"."id"
				)`);
			}
			// SQLite syntax
			return sequelize.literal(`(
				SELECT COUNT(*)
				FROM Reviews AS reviews
				WHERE reviews.spotId = Spot.id
			)`);
		}
	}
	Spot.init(
		{
			ownerId: { type: DataTypes.INTEGER, allowNull: false },
			address: { type: DataTypes.STRING, allowNull: false },
			city: { type: DataTypes.STRING, allowNull: false },
			state: { type: DataTypes.STRING, allowNull: false },
			country: { type: DataTypes.STRING, allowNull: false },
			lat: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: { min: -90, max: 90 },
			},
			lng: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: { min: -180, max: 180 },
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: { len: [0, 50] },
			},
			description: { type: DataTypes.STRING, allowNull: false },
			price: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: { min: 0 },
			},
		},
		{
			sequelize,
			modelName: 'Spot',
		},
	);
	return Spot;
};
