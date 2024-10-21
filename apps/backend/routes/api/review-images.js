const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { ReviewImage, Review } = require('../../db/models');

const router = express.Router();

router.delete('/:imageId', requireAuth, async (req, res) => {
	const reviewImage = await ReviewImage.findByPk(req.params.imageId, {
		include: {
			model: Review,
			as: 'Review',
			attributes: ['userId'],
		},
	});

	if (!reviewImage) {
		return res.status(404).json({ message: "Review Image couldn't be found" });
	}

	if (reviewImage.Review.userId !== req.user.id) {
		return res.status(403).json({ message: 'Forbidden' });
	}

	await reviewImage.destroy();
	res.status(200).json({ message: 'Successfully deleted' });
});

module.exports = router;
