const express = require('express');

const { requireAuth } = require('../../utils/auth');

const { Op } = require('sequelize');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const {
	Spot,
	SpotImage,
	User,
	Review,
	ReviewImage,
	sequelize,
} = require('../../db/models');

const validateSpot = [
	check('address')
		.exists({ checkFalsy: true })
		.withMessage('Street address is required'),
	check('city').exists({ checkFalsy: true }).withMessage('City is required'),
	check('state').exists({ checkFalsy: true }).withMessage('State is required'),
	check('country')
		.exists({ checkFalsy: true })
		.withMessage('Country is required'),
	check('lat')
		.exists({ checkFalsy: true })
		.isInt({ min: -90, max: 90 })
		.withMessage('Latitude must be within -90 and 90'),
	check('lng')
		.exists({ checkFalsy: true })
		.isInt({ min: -180, max: 180 })
		.withMessage('Longitude must be within -180 and 180"'),
	check('name')
		.exists({ checkFalsy: true })
		.isLength({ min: 1, max: 50 })
		.withMessage('Name must be less than 50 characters'),
	check('description')
		.exists({ checkFalsy: true })
		.withMessage('Description is required'),
	check('price')
		.exists({ checkFalsy: true })
		.isFloat({ min: 0 })
		.withMessage('Price per day must be a positive number'),
	handleValidationErrors,
];

const validateReview = [
	check('review')
		.exists({ checkFalsy: true })
		.withMessage('Review text is required'),
	check('stars')
		.exists({ checkFalsy: true })
		.isInt({ min: 1, max: 5 })
		.withMessage('Stars must be an integer from 1 to 5'),
	handleValidationErrors,
];

const validateQuery = [
	check('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be greater than or equal to 1'),
	check('size')
		.optional()
		.isInt({ min: 1, max: 20 })
		.withMessage('Size must be between 1 and 20'),
	check('maxLat')
		.optional()
		.isInt({ min: -90, max: 90 })
		.withMessage('Maximum latitude is invalid'),
	check('minLat')
		.optional()
		.isInt({ min: -90, max: 90 })
		.withMessage('Minimum latitude is invalid'),
	check('minLng')
		.optional()
		.isInt({ min: -180, max: 180 })
		.withMessage('Minimum longitude is invalid'),
	check('maxLng')
		.optional()
		.isInt({ min: -180, max: 180 })
		.withMessage('Maximum longitude is invalid'),
	check('minPrice')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Minimum price must be greater than or equal to 0'),
	check('maxPrice')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Maximum price must be greater than or equal to 0'),
	handleValidationErrors,
];

const router = express.Router();

// Create a spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;
		+lat;
		+lng;
		+price;
	const newSpot = await Spot.create({
		ownerId: req.user.id,
		address,
		city,
		state,
		country,
		lat,
		lng,
		name,
		description,
		price,
	});
	res.status(201).json(newSpot);
});

// Get all spots owned by the Current User
router.get('/current', requireAuth, async (req, res) => {
	if (!req.user) {
		return res.status(200).json({ user: null });
	}

	const spots = await Spot.findAll({
		attributes: [
			'id',
			'ownerId',
			'address',
			'city',
			'state',
			'country',
			'lat',
			'lng',
			'name',
			'description',
			'price',
			'createdAt',
			'updatedAt',
			[
				sequelize.literal(`(
                SELECT AVG("stars")
                FROM "air_bnb"."Reviews" AS "reviews"
                WHERE "reviews"."spotId" = "Spot"."id"
            )`),
				'avgRating',
			],
			[
				sequelize.literal(`(
                SELECT "url"
                FROM "air_bnb"."SpotImages" AS "images"
                WHERE "images"."spotId" = "Spot"."id" AND "images"."preview" = true
                LIMIT 1
            )`),
				'previewImage',
			],
		],
		where: { ownerId: req.user.id },
	});

	if (!spots.length) {
		return res
			.status(404)
			.json({ message: 'No spots found for the current user' });
	}

	res.json({ Spots: spots });
});

// Get all Reviews by a Spot's ID
router.get('/:spotId/reviews', async (req, res) => {
	const spot = await Spot.findByPk(req.params.spotId);
	if (spot) {
		const reviews = await spot.getReviews({
			include: [
				{
					model: User,
					attributes: ['id', 'firstName', 'lastName'],
					as: 'User',
				},
				{ model: ReviewImage, as: 'ReviewImages' },
			],
		});
		res.json({ Reviews: reviews });
	} else {
		res.status(404).json({ message: "Spot couldn't be found" });
	}
});

router.post(
	'/:spotId/reviews',
	requireAuth,
	validateReview,
	async (req, res) => {
		const spot = await Spot.findByPk(req.params.spotId);
		if (spot) {
			const existingReview = await Review.findOne({
				where: { userId: req.user.id, spotId: req.params.spotId },
			});
			if (existingReview) {
				res
					.status(500)
					.json({ message: 'User already has a review for this spot' });
				return;
			}
			const { review, stars } = req.body;
			const newReview = await Review.create({
				userId: req.user.id,
				spotId: req.params.spotId,
				review,
				stars,
			});
			res.status(201).json(newReview);
		} else {
			res.status(404).json({ message: "Spot couldn't be found" });
		}
	},
);

// Get a spot by id
router.get('/:spotId', async (req, res) => {
	const spot = await Spot.findByPk(req.params.spotId, {
		attributes: [
			'id',
			'ownerId',
			'address',
			'city',
			'state',
			'country',
			'lat',
			'lng',
			'name',
			'description',
			'price',
			'createdAt',
			'updatedAt',
			[
				sequelize.literal(`(
		SELECT COUNT(*)
		FROM "air_bnb"."Reviews" AS "reviews"
		WHERE "reviews"."spotId" = "Spot"."id"
	)`),
				'numReviews',
			],
			[
				sequelize.literal(`(
		SELECT AVG("reviews"."stars")
		FROM "air_bnb"."Reviews" AS "reviews"
		WHERE "reviews"."spotId" = "Spot"."id"
	)`),
				'avgStarRating',
			],
		],
		include: [
			{
				model: SpotImage,
				as: 'SpotImages',
				attributes: ['id', 'url', 'preview'],
			},
			{
				model: User,
				as: 'Owner',
				attributes: ['id', 'firstName', 'lastName'],
			},
		],
	});
	if (spot) {
		res.status(200).json(spot);
	} else {
		res.status(404).json({ message: "Spot couldn't be found" });
	}
});

// Edit a spot
router.put('/:spotId', requireAuth, validateSpot, async (req, res) => {
	const spot = await Spot.findByPk(req.params.spotId);
	if (spot) {
		if (spot.ownerId !== req.user.id) {
			res.status(403).json({ message: 'Forbidden' });
			return;
		}
		await spot.update(req.body);
		res.json(spot);
	} else {
		res.status(404).json({ message: "Spot couldn't be found" });
	}
});

// Add a spot image
router.post('/:spotId/images', requireAuth, async (req, res) => {
	const spot = await Spot.findByPk(req.params.spotId);
	if (spot) {
		if (spot.ownerId !== req.user.id) {
			res.status(403).json({ message: 'Forbidden' });
			return;
		}
		const image = await SpotImage.create({
			spotId: spot.id,
			url: req.body.url,
			preview: req.body.preview,
		});
		res.status(201).json(image);
	} else {
		res.status(404).json({ message: "Spot couldn't be found" });
	}
});

// Delete a spot
router.delete('/:spotId', requireAuth, async (req, res) => {
	const spot = await Spot.findByPk(req.params.spotId);
	if (spot) {
		if (spot.ownerId !== req.user.id) {
			res.status(403).json({ message: 'Forbidden' });
			return;
		}
		await spot.destroy();
		res.status(200).json({ message: 'Successfully deleted' });
	} else {
		res.status(404).json({ message: "Spot couldn't be found" });
	}
});

// Get all spots
router.get('/', validateQuery, async (req, res) => {
	try {
		let {
			page = 1,
			size = 20,
			minLat,
			maxLat,
			minLng,
			maxLng,
			minPrice,
			maxPrice,
		} = req.query;

		page = +page || 1;
		size = +size || 20;
		minLat = +minLat;
		maxLat = +maxLat;
		minLng = +minLng;
		maxLng = +maxLng;
		minPrice = +minPrice;
		maxPrice = +maxPrice;

		const pagination = {
			limit: size,
			offset: (page - 1) * size,
		};

		const where = {};

		if (!isNaN(minLat)) where.lat = { [Op.gte]: minLat };
		if (!isNaN(maxLat)) where.lat = { ...where.lat, [Op.lte]: maxLat };
		if (!isNaN(minLng)) where.lng = { [Op.gte]: minLng };
		if (!isNaN(maxLng)) where.lng = { ...where.lng, [Op.lte]: maxLng };
		if (!isNaN(minPrice) && minPrice >= 0) where.price = { [Op.gte]: minPrice };
		if (!isNaN(maxPrice) && maxPrice >= 0)
			where.price = { ...where.price, [Op.lte]: maxPrice };

		const spots = await Spot.findAll({
			where,
			...pagination,
			attributes: [
				'id',
				'ownerId',
				'address',
				'city',
				'state',
				'country',
				'lat',
				'lng',
				'name',
				'description',
				'price',
				'createdAt',
				'updatedAt',
				[
					sequelize.literal(`(
		SELECT AVG("reviews"."stars")
		FROM "air_bnb"."Reviews" AS "reviews"
		WHERE "reviews"."spotId" = "Spot"."id"
	)`),
					'avgRating',
				],
				[
					sequelize.literal(`(
		SELECT "images"."url"
		FROM "air_bnb"."SpotImages" AS "images"
		WHERE "images"."spotId" = "Spot"."id"
		AND "images"."preview" = true
		LIMIT 1
	)`),
					'previewImage',
				],
			],
		});

		res.json({ Spots: spots, page, size });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = router;
