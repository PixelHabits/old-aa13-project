const express = require('express');

const { requireAuth } = require('../../utils/auth');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { Spot, SpotImage, User, sequelize } = require('../../db/models');

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
		.isFloat({ min: -90, max: 90 })
		.withMessage('Latitude must be within -90 and 90'),
	check('lng')
		.exists({ checkFalsy: true })
		.isFloat({ min: -180, max: 180 })
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

const router = express.Router();

// Create a spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;
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
                    SELECT AVG(stars)
                    FROM Reviews AS reviews
                    WHERE reviews.spotId = Spot.id
                )`),
				'avgRating',
			],
			[
				sequelize.literal(`(
                    SELECT url
                    FROM SpotImages AS images
                    WHERE images.spotId = Spot.id AND images.preview = true
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
                    FROM Reviews AS reviews
                    WHERE reviews.spotId = Spot.id
                )`),
				'numReviews',
			],
			[
				sequelize.literal(`(
                    SELECT AVG(stars)
                    FROM Reviews AS reviews
                    WHERE reviews.spotId = Spot.id
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
router.get('/', async (_req, res) => {
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
                    SELECT AVG(stars)
                    FROM Reviews AS reviews
                    WHERE reviews.spotId = Spot.id
                )`),
				'avgRating',
			],
			[
				sequelize.literal(`(
                    SELECT url
                    FROM SpotImages AS images
                    WHERE images.spotId = Spot.id AND images.preview = true
                    LIMIT 1
                )`),
				'previewImage',
			],
		],
	});
	res.json({ Spots: spots });
});

module.exports = router;
