const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { SpotImage, Spot } = require('../../db/models');

const router = express.Router();

router.delete('/:id', requireAuth, async (req, res) => {
	const spotImage = await SpotImage.findByPk(req.params.id, {
		include: {
			model: Spot,
      as: 'Spot',
			attributes: ['ownerId'],
		},
	});

	if (!spotImage) {
		return res.status(404).json({ message: "Spot Image couldn't be found" });
	}

	if (spotImage.Spot.ownerId !== req.user.id) {
		return res.status(403).json({ message: 'Forbidden' });
	}

	await spotImage.destroy();
	res.status(200).json({ message: 'Successfully deleted' });
});

module.exports = router;
