const express = require('express');

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const { requireAuth } = require('../../utils/auth');

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const { check } = require('express-validator');
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

module.exports = router;
