const express = require('express');

const { requireAuth } = require('../../utils/auth');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const {
	Review,
	Spot,
	ReviewImage,
	User,
	sequelize,
} = require('../../db/models');

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
const router = express.Router();

// Get all reviews of the Current User
router.get('/current', requireAuth, async (req, res) => {
	const reviews = await Review.findAll({
		where: {
			userId: req.user.id,
		},
		include: [
			{
				model: Spot,
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
					'price',
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
			},
			{ model: ReviewImage, as: 'ReviewImages' },
			{ model: User, attributes: ['id', 'firstName', 'lastName'] },
		],
	});
	res.json({ Reviews: reviews });
});

// Add an image to a review
router.post('/:reviewId/images', requireAuth, async (req, res) => {
	const review = await Review.findByPk(req.params.reviewId);
	if (!review) {
		return res.status(404).json({ message: "Review couldn't be found" });
	}
	const numOfImages = await ReviewImage.count({
		where: { reviewId: review.id },
	});
	if (numOfImages >= 10) {
		return res.status(403).json({
			message: 'Maximum number of images for this resource was reached',
		});
	}
	if (review.userId !== req.user.id) {
		return res.status(403).json({ message: 'Forbidden' });
	}
	const newImage = await ReviewImage.create({
		reviewId: review.id,
		url: req.body.url,
	});
	res.status(201).json(newImage);
});

//Edit a review
router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
	const review = await Review.findByPk(req.params.reviewId);
	if (!review) {
		return res.status(404).json({ message: "Review couldn't be found" });
	}
	if (review.userId !== req.user.id) {
		return res
			.status(403)
			.json({ message: 'You are not authorized to edit this review' });
	}
	await review.update(req.body);
	res.json(review);
});

// Delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
	const review = await Review.findByPk(req.params.reviewId);
	if (!review) {
		return res.status(404).json({ message: "Review couldn't be found" });
	}
	if (review.userId !== req.user.id) {
		return res
			.status(403)
			.json({ message: 'You are not authorized to delete this review' });
	}
	await review.destroy();
	res.status(200).json({ message: 'Successfully deleted' });
});

module.exports = router;
